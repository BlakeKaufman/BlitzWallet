import * as secp from '@noble/secp256k1';
import {retrieveData} from '../secureStore';
import {getPublicKey, nip06} from 'nostr-tools';
import {Buffer} from 'buffer'; // Buffer from 'buffer' for encoding and decoding
import * as crypto from 'react-native-quick-crypto';

export async function deriveSharedSecret(otherPublicKey) {
  const privKey = await getPrivteKey();
  console.log('Other Public Key:', otherPublicKey);

  let pubKey;

  // Parse public key
  try {
    pubKey = secp.ProjectivePoint.fromHex(otherPublicKey); // Validate the public key
  } catch (error) {
    console.log(error);
    throw new Error('Invalid public key: Not on curve or wrong format');
  }

  console.log('Validated Public Key:', pubKey.toHex());

  // Derive shared secret
  const sharedSecret = secp.getSharedSecret(privKey, pubKey.toRawBytes(false));
  const sharedSecretHex = Buffer.from(sharedSecret).toString('hex');

  console.log('Shared Secret:', sharedSecretHex);
  return sharedSecretHex;
}

export async function createCorrectPublicKey() {
  // Get private key from mnemonic
  const privateKey = await getPrivteKey();

  // Generate public key
  let publicKey = secp.getPublicKey(privateKey);

  console.log(publicKey, publicKey.length);
  // Ensure public key is in the correct format
  if (publicKey.length === 64) {
    // Convert to uncompressed format if needed

    publicKey = secp.ProjectivePoint.fromHex(`04${publicKey}`).toRawBytes(
      false,
    ); // Uncompressed
  }

  console.log('Private Key:', privateKey.toString('hex'));
  console.log('Public Key:', Buffer.from(publicKey).toString('hex'));

  return {
    privateKey: privateKey.toString('hex'),
    publicKey: Buffer.from(publicKey).toString('hex'),
  };
}

async function getPrivteKey() {
  // Get private key from mnemonic
  const mnemonic = await retrieveData('mnemonic'); // Retrieve mnemonic
  const privateKey = Buffer.from(
    nip06.privateKeyFromSeedWords(mnemonic),
    'hex',
  );
  return privateKey;
}

async function deriveKey(sharedSecret) {
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(sharedSecret); // Convert the shared secret to a buffer

  // Use PBKDF2 or a different KDF to derive a 256-bit key (AES-256)
  const key = await crypto.default.subtle.importKey(
    'raw',
    keyMaterial,
    {name: 'AES-GCM'},
    false,
    ['encrypt', 'decrypt'],
  );

  return key;
}

export async function sharedKeyEncription(otherPublicKey, message) {
  const sharedSecret = await deriveSharedSecret(otherPublicKey);
  const key = await deriveKey(sharedSecret);

  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(message);

  // Generate a random initialization vector (IV) - 12 bytes for GCM
  const iv = randomBytes(12);

  // Encrypt the message using AES-GCM
  const encryptedContent = await crypto.subtle.encrypt(
    {name: 'AES-GCM', iv: iv},
    key,
    encodedMessage,
  );

  // Convert the encrypted data and IV to Base64 before storing
  const encryptedMessageBase64 = Buffer.from(
    new Uint8Array(encryptedContent),
  ).toString('base64');
  const ivBase64 = Buffer.from(iv).toString('base64');

  // Return the encrypted message and IV in Base64 format
  return {
    encryptedMessage: encryptedMessageBase64,
    iv: ivBase64,
  };
}

export async function sharedKeyDecryption(otherPublicKey, encryptedData) {
  const sharedSecret = await deriveSharedSecret(otherPublicKey);
  const key = await deriveKey(sharedSecret);

  // Extract the encrypted message and IV from Base64 format
  const encryptedMessage = Buffer.from(
    encryptedData.encryptedMessage,
    'base64',
  );
  const iv = Buffer.from(encryptedData.iv, 'base64');

  // Decrypt the message using AES-GCM
  const decryptedContent = await crypto.subtle.decrypt(
    {name: 'AES-GCM', iv: iv},
    key,
    encryptedMessage,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedContent); // Return the decrypted message as a string
}
