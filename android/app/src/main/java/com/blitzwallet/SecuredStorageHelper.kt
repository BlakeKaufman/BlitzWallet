package com.blitzwallet

import android.content.Context
import android.content.SharedPreferences
import android.preference.PreferenceManager
import android.security.keystore.KeyPermanentlyInvalidatedException
import android.util.Log
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.securestore.encryptors.AESEncryptor
import expo.modules.securestore.encryptors.HybridAESEncryptor
import expo.modules.securestore.encryptors.KeyBasedEncryptor
import kotlinx.coroutines.runBlocking
import org.json.JSONException
import org.json.JSONObject
import java.security.GeneralSecurityException
import java.security.KeyStore
import java.security.KeyStore.PrivateKeyEntry
import java.security.KeyStore.SecretKeyEntry
import javax.crypto.BadPaddingException
import java.security.KeyStoreException
import expo.modules.securestore.AuthenticationHelper
import expo.modules.securestore.SecureStoreOptions
import android.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import java.nio.charset.StandardCharsets

internal class DecryptException(message: String?, key: String, keychain: String, cause: Throwable? = null) :
  CodedException("Could not decrypt the value for key '$key' under keychain '$keychain'. Caused by: ${message ?: "unknown"}", cause)

open class SecuredStorageHelper() {
  private val mAESEncryptor = AESEncryptor()

  private lateinit var keyStore: KeyStore
  private lateinit var hybridAESEncryptor: HybridAESEncryptor
  private lateinit var authenticationHelper: AuthenticationHelper

  suspend fun getItemImpl(key: String, options: SecureStoreOptions, appContext: Context): String? {
    val keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER)
    keyStore.load(null)
    this@SecuredStorageHelper.keyStore = keyStore

    // authenticationHelper = AuthenticationHelper(appContext)

    // We use a SecureStore-specific shared preferences file, which lets us do things like enumerate
    // its entries or clear all of them
    val prefs: SharedPreferences = getSharedPreferences(appContext)
    val keychainAwareKey = createKeychainAwareKey(key, options.keychainService)
    if (prefs.contains(keychainAwareKey)) {
      return readJSONEncodedItem(key, prefs, options)
    } else if (prefs.contains(key)) { // For backwards-compatibility try to read using the old key format
      return readJSONEncodedItem(key, prefs, options)
    }
    return null
  }

  suspend fun decryptItem(
    key: String,
    encryptedItem: JSONObject,
    keyStoreEntry: KeyStore.SecretKeyEntry,
    options: SecureStoreOptions
  ): String {
    val ciphertext = encryptedItem.getString(CIPHERTEXT_PROPERTY)
    val ivString = encryptedItem.getString(IV_PROPERTY)
    val authenticationTagLength = encryptedItem.getInt(GCM_AUTHENTICATION_TAG_LENGTH_PROPERTY)
    val ciphertextBytes = Base64.decode(ciphertext, Base64.DEFAULT)
    val ivBytes = Base64.decode(ivString, Base64.DEFAULT)
    val gcmSpec = GCMParameterSpec(authenticationTagLength, ivBytes)
    val cipher = Cipher.getInstance(AES_CIPHER)

    if (authenticationTagLength < MIN_GCM_AUTHENTICATION_TAG_LENGTH) {
      throw DecryptException("Authentication tag length must be at least $MIN_GCM_AUTHENTICATION_TAG_LENGTH bits long", key, options.keychainService)
    }
    cipher.init(Cipher.DECRYPT_MODE, keyStoreEntry.secretKey, gcmSpec)
    val unlockedCipher = cipher
    return String(unlockedCipher.doFinal(ciphertextBytes), StandardCharsets.UTF_8)
  }

  private suspend fun readJSONEncodedItem(key: String, prefs: SharedPreferences, options: SecureStoreOptions): String? {
    val keychainAwareKey = createKeychainAwareKey(key, options.keychainService)

    val legacyEncryptedItemString = prefs.getString(key, null)
    val currentEncryptedItemString = prefs.getString(keychainAwareKey, null)
    val encryptedItemString = currentEncryptedItemString ?: legacyEncryptedItemString
    
    // It's not possible to efficiently remove all values from older versions of secure-store when an invalidated keychain is deleted.
    // In some edge cases it will lead to read errors until the value is removed from the shared preferences
    val legacyReadFailedWarning = if (currentEncryptedItemString == null) {
      ". This exception occurred when trying to read a value saved with an " +
      "older version of `expo-secure-store`. It usually means that the keychain you provided is incorrect, " +
      "but it might be raised because the keychain used to decrypt this key has been invalidated and deleted." +
      " If you are confident that the keychain you provided is correct and want to avoid this error in the " +
      "future you should save a new value under this key or use `deleteItemImpl()` and remove the existing one."
    } else {
        ""
    }

    encryptedItemString ?: return null
    
    val encryptedItem: JSONObject = try {
        JSONObject(encryptedItemString)
    } catch (e: JSONException) {
        throw DecryptException("Could not parse the encrypted JSON item in SecureStore: ${e.message}", key, options.keychainService, e)
    }
    
    val scheme = encryptedItem.optString(SCHEME_PROPERTY).takeIf { it.isNotEmpty() }
    ?: throw DecryptException("Could not find the encryption scheme used for key: $key", key, options.keychainService)
    val requireAuthentication = encryptedItem.optBoolean(AuthenticationHelper.REQUIRE_AUTHENTICATION_PROPERTY, false)
    val usesKeystoreSuffix = encryptedItem.optBoolean(USES_KEYSTORE_SUFFIX_PROPERTY, false)
    
    try {
      when (scheme) {
        AESEncryptor.NAME -> {
          val secretKeyEntry = getKeyEntryCompat(SecretKeyEntry::class.java, mAESEncryptor, options, requireAuthentication, usesKeystoreSuffix) ?: run {
            Log.w(
              TAG,
              "An entry was found for key $key under keychain ${options.keychainService}, but there is no corresponding KeyStore key. " +
                "This situation occurs when the app is reinstalled. The value will be removed to avoid future errors. Returning null"
            )
            return null
          }
          return decryptItem(key, encryptedItem, secretKeyEntry, options)
        }
        HybridAESEncryptor.NAME -> {
          val privateKeyEntry = getKeyEntryCompat(PrivateKeyEntry::class.java, hybridAESEncryptor, options, requireAuthentication, usesKeystoreSuffix)
            ?: return null
        
          return hybridAESEncryptor.decryptItem(key, encryptedItem, privateKeyEntry, options, authenticationHelper)
        }
        else -> {
          throw DecryptException("The item for key $key in SecureStore has an unknown encoding scheme $scheme)", key, options.keychainService)
        }
      }
    } catch (e: KeyPermanentlyInvalidatedException) {
      Log.w(TAG, "The requested key has been permanently invalidated. Returning null")
      return null
    } catch (e: BadPaddingException) {
      // The key from the KeyStore is unable to decode the entry. This is because a new key was generated, but the entries are encrypted using the old one.
      // This usually means that the user has reinstalled the app. We can safely remove the old value and return null as it's impossible to decrypt it.
      Log.w(
        TAG,
        "Failed to decrypt the entry for $key under keychain ${options.keychainService}. " +
          "The entry in shared preferences is out of sync with the keystore. It will be removed, returning null."
      )
      return null
    } catch (e: GeneralSecurityException) {
      throw (DecryptException(e.message, key, options.keychainService, e))
    } catch (e: CodedException) {
      throw e
    } catch (e: Exception) {
      throw (DecryptException(e.message, key, options.keychainService, e))
    }
  }


  /**
   * Each key is stored under a keychain service that requires authentication, or one that doesn't
   * Keys used to be stored under a single keychain, which led to different behaviour on iOS and Android.
   * Because of that we need to check if there are any keys stored with the old secure-store key format.
   */
  private fun <E : KeyStore.Entry> getLegacyKeyEntry(
    keyStoreEntryClass: Class<E>,
    encryptor: KeyBasedEncryptor<E>,
    options: SecureStoreOptions
  ): E? {
    val keystoreAlias = encryptor.getKeyStoreAlias(options)
    if (!keyStore.containsAlias(encryptor.getKeyStoreAlias(options))) {
      return null
    }

    val entry = keyStore.getEntry(keystoreAlias, null)
    if (!keyStoreEntryClass.isInstance(entry)) {
      return null
    }
    return keyStoreEntryClass.cast(entry)
  }

  private fun <E : KeyStore.Entry> getKeyEntry(
    keyStoreEntryClass: Class<E>,
    encryptor: KeyBasedEncryptor<E>,
    options: SecureStoreOptions,
    requireAuthentication: Boolean
  ): E? {
    val keystoreAlias = encryptor.getExtendedKeyStoreAlias(options, requireAuthentication)
    return if (keyStore.containsAlias(keystoreAlias)) {
        val entry = keyStore.getEntry(keystoreAlias, null)
        if (!keyStoreEntryClass.isInstance(entry)) {
            throw KeyStoreException("The entry for the keystore alias \"$keystoreAlias\" is not a ${keyStoreEntryClass.simpleName}")
        }
        keyStoreEntryClass.cast(entry)
        ?: throw KeyStoreException("The entry for the keystore alias \"$keystoreAlias\" couldn't be cast to correct class")
    } else {
      null
    }
  }

  private fun <E : KeyStore.Entry> getOrCreateKeyEntry(
    keyStoreEntryClass: Class<E>,
    encryptor: KeyBasedEncryptor<E>,
    options: SecureStoreOptions,
    requireAuthentication: Boolean
  ): E {
    return getKeyEntry(keyStoreEntryClass, encryptor, options, requireAuthentication) ?: run {
      // Android won't allow us to generate the keys if the device doesn't support biometrics or no biometrics are enrolled
      if (requireAuthentication) {
        authenticationHelper.assertBiometricsSupport()
      }
      encryptor.initializeKeyStoreEntry(keyStore, options)
    }
  }

  private fun <E : KeyStore.Entry> getKeyEntryCompat(
    keyStoreEntryClass: Class<E>,
    encryptor: KeyBasedEncryptor<E>,
    options: SecureStoreOptions,
    requireAuthentication: Boolean,
    usesKeystoreSuffix: Boolean
  ): E? {
    return if (usesKeystoreSuffix) {
        getKeyEntry(keyStoreEntryClass, encryptor, options, requireAuthentication)
    } else {
      getLegacyKeyEntry(keyStoreEntryClass, encryptor, options)
    }
  }

  fun getSharedPreferences(reactContext: Context): SharedPreferences {
    return reactContext.getSharedPreferences(SHARED_PREFERENCES_NAME, Context.MODE_PRIVATE)
  }

  /**
   * Adds the keychain service as a prefix to the key in order to avoid conflicts in shared preferences
   * when there are two identical keys but saved with different keychains.
   */
  private fun createKeychainAwareKey(key: String, keychainService: String): String {
    return "$keychainService-$key"
  }

  companion object {
    const val TAG = "ForegroundService"
    private const val SHARED_PREFERENCES_NAME = "SecureStore"
    private const val KEYSTORE_PROVIDER = "AndroidKeyStore"
    private const val SCHEME_PROPERTY = "scheme"
    private const val KEYSTORE_ALIAS_PROPERTY = "keystoreAlias"
    const val USES_KEYSTORE_SUFFIX_PROPERTY = "usesKeystoreSuffix"
    const val DEFAULT_KEYSTORE_ALIAS = "key_v1"
    const val AUTHENTICATED_KEYSTORE_SUFFIX = "keystoreAuthenticated"
    const val UNAUTHENTICATED_KEYSTORE_SUFFIX = "keystoreUnauthenticated"
    const val AES_CIPHER = "AES/GCM/NoPadding"
    const val AES_KEY_SIZE_BITS = 256
    private const val CIPHERTEXT_PROPERTY = "ct"
    const val IV_PROPERTY = "iv"
    private const val GCM_AUTHENTICATION_TAG_LENGTH_PROPERTY = "tlen"
    private const val MIN_GCM_AUTHENTICATION_TAG_LENGTH = 96
  }
}