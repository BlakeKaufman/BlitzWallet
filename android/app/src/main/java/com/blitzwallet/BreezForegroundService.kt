package com.blitzwallet
import breez_sdk.ConnectRequest
import breez_sdk.EnvironmentType
import breez_sdk.GreenlightNodeConfig
import breez_sdk.NodeConfig
import breez_sdk.defaultConfig
import breez_sdk.mnemonicToSeed
import breez_sdk_notification.ForegroundService
import breez_sdk_notification.NotificationHelper.Companion.registerNotificationChannels
import breez_sdk_notification.ServiceConfig
import com.blitzwallet.BuildConfig
import com.blitzwallet.SecuredStorageHelper
import expo.modules.securestore.SecureStoreOptions
import android.content.SharedPreferences
import kotlinx.coroutines.runBlocking
import android.util.Log
import android.content.Context

class BreezForegroundService : ForegroundService() {
    companion object {
        private const val TAG = "ForegroundService"
        private const val ACCOUNT_MNEMONIC = "mnemonic"
    }
    
    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Creating foreground service...")
        registerNotificationChannels(applicationContext)
        Log.d(TAG, "Foreground service created.")
    }

    fun readSecuredValue(key: String): String? {
        return try {
            val secureStore = SecuredStorageHelper()
            val options = SecureStoreOptions() // Configure options if necessary

            // Access the value synchronously
            runBlocking {
                secureStore.getItemImpl(key, options, applicationContext)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    override fun getConnectRequest(): ConnectRequest? {
        // Get the Breez API key from the build config
        val apiKey = BuildConfig.BREEZ_SDK_API_KEY
        Log.v(TAG, "API_KEY: $apiKey")
        val glNodeConf = GreenlightNodeConfig(null, null)
        val nodeConf = NodeConfig.Greenlight(glNodeConf)
        val config = defaultConfig(EnvironmentType.PRODUCTION, apiKey, nodeConf)

        config.workingDir = "${applicationContext.filesDir}/breezSdk"


        // Get the mnemonic from secured storage using an implementation of
        // `readSecuredValue` depending on how data is written to secured storage.
        // See Developer Note

        val mnemonic = readSecuredValue(ACCOUNT_MNEMONIC);

        if (!mnemonic.isNullOrEmpty()) {
            return ConnectRequest(config, mnemonicToSeed(mnemonic))
        } else {
            Log.v(TAG, "Mnemonic not found")
            return null
        }

    }

    override fun getServiceConfig(): ServiceConfig? {
        return ServiceConfig.default()
    }
}