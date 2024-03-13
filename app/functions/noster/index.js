import {generateSecureRandom} from 'react-native-securerandom';

import {deleteItem, retrieveData, storeData} from '../secureStore';

// import crypto from 'expo-crypto';
import * as secp from '@noble/secp256k1';
import * as nostr from 'nostr-tools';
import * as crypto from 'react-native-quick-crypto';
import generateMnemnoic from '../seed';
import {btoa, atob, toByteArray} from 'react-native-quick-base64';

async function getPubPrivateKeys() {
  try {
    const retrievedMnemonic = await retrieveData('nostrMnemonic');
    const mnemonic = retrievedMnemonic || (await generateMnemnoic());

    const privateKey = nostr.nip06.privateKeyFromSeedWords(mnemonic);
    const publicKey = nostr.getPublicKey(privateKey);
    const npub = nostr.nip19.npubEncode(privateKey);
    const nsec = nostr.nip19.nsecEncode(privateKey);

    console.log(nostr.nip19.decode(nsec));

    console.log(npub, nsec);

    if (!retrievedMnemonic) storeData('nostrMnemonic', mnemonic);

    return new Promise(resolve => {
      resolve([publicKey, privateKey]);
    });
  } catch (err) {
    console.log(err);
  }
}

// this will return events and then you decript messages outside of funciton
async function connectToRelay(pubKeyOfContacts, privateKey, pubkey) {
  return new Promise(async resolve => {
    const relay = 'wss://relay.blackbyte.nl';
    const socket = new WebSocket(relay);

    socket.addEventListener('message', async function (message) {
      const [type, subId, event] = JSON.parse(message.data);
      console.log(type, subId);
      let {kind, content} = event || {};
      if (!event || event === true) return;
      console.log('message', event);
      if (kind === 4) {
        content = decryptMessage(privateKey, pubkey, content);
      }
      console.log('content:', content);
    });

    const randomBytesArray = await generateSecureRandom(32);
    const derivedPrivateKey = Buffer.from(randomBytesArray);
    // Create a public key from the private key

    const subId = derivedPrivateKey.toString('hex').substring(0, 16);

    const filter = {authors: [pubKeyOfContacts[0]]};

    socket.addEventListener('open', async function (e) {
      console.log('connected to ' + relay);

      const subscription = ['REQ', subId, filter];
      console.log('subscription', subscription);

      socket.send(JSON.stringify(subscription));

      resolve({didConnect: true, socket: socket});
    });
  });
}

async function getSignedEvent(event, privateKey) {
  let signedEvent = nostr.finishEvent(event, privateKey);

  const isGood = nostr.validateEvent(signedEvent);

  return new Promise(resolve => {
    if (isGood) resolve(signedEvent);
    else resolve(false);
  });
}

async function sendNostrMessage(socket, content, privateKey, pubKey) {
  const event = {
    content: encriptMessage(privateKey, pubKey, content), //shared key between parties
    created_at: Math.floor(Date.now() / 1000),
    kind: 4,
    tags: [['p', pubKey]], //thier pub key
  };
  const singedEvent = await getSignedEvent(event, privateKey);
  if (!singedEvent)
    return new Promise(resolve => {
      resolve(false);
    });
  socket.send(JSON.stringify(['EVENT', singedEvent]));
}

function encriptMessage(privkey, pubkey, text) {
  try {
    const shardPoint = secp.getSharedSecret(privkey, '02' + pubkey);
    const sharedX = shardPoint.slice(1, 33);

    const iv = crypto.default.randomFillSync(new Uint8Array(16));

    const cipher = crypto.default.createCipheriv(
      'aes-256-cbc',
      Buffer.from(sharedX),
      iv,
    );

    let encriptMessage = cipher.update(text, 'utf8', 'base64');
    encriptMessage += cipher.final('base64');
    encriptMessage +=
      '?iv=' + btoa(String.fromCharCode.apply(null, new Uint8Array(iv.buffer)));
    return encriptMessage;
  } catch (err) {
    console.log(err);
  }
}
function decryptMessage(privkey, pubkey, encryptedText) {
  try {
    const shardPoint = secp.getSharedSecret(privkey, '02' + pubkey);
    const sharedX = shardPoint.slice(1, 33);

    // Extract IV from the encrypted message
    const ivStr = encryptedText.split('?iv=')[1];
    const iv = new Uint8Array(Buffer.from(atob(ivStr), 'binary'));

    // Remove IV from the encrypted message
    const encryptedData = encryptedText.split('?iv=')[0];

    const decipher = crypto.default.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(sharedX),
      iv,
    );

    let decryptedMessage = decipher.update(encryptedData, 'base64', 'utf8');
    decryptedMessage += decipher.final('utf8');
    return decryptedMessage;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export {getPubPrivateKeys, sendNostrMessage, connectToRelay};
