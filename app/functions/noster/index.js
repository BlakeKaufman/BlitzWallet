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
    const npub = nostr.nip19.npubEncode(publicKey);
    const nsec = nostr.nip19.nsecEncode(privateKey);

    console.log(
      nostr.nip19.decode(nsec),
      nostr.nip19.decode(
        'npub10elfcs4fr0l0r8af98jlmgdh9c8tcxjvz9qkw038js35mp4dma8qzvjptg',
      ),
    );
    const decodeNpub = nostr.nip19.decode(npub).data;
    const decodeNsec = nostr.nip19.decode(nsec).data;

    console.log(npub, nsec, privateKey, publicKey, decodeNpub, decodeNsec);

    if (!retrievedMnemonic) storeData('nostrMnemonic', mnemonic);

    return new Promise(resolve => {
      resolve([decodeNpub, decodeNsec]);
    });
  } catch (err) {
    console.log(err);
  }
}

// this will return events and then you decript messages outside of funciton
async function connectToRelay(
  pubKeyOfContacts,
  privateKey,
  pubkey,
  receiveEventListener,
) {
  return new Promise(async resolve => {
    const relay = 'wss://relay.damus.io';
    const socket = new WebSocket(relay);

    socket.addEventListener('message', message => {
      receiveEventListener(message, privateKey, pubkey);
    });

    const randomBytesArray = await generateSecureRandom(32);
    const derivedPrivateKey = Buffer.from(randomBytesArray);
    // Create a public key from the private key

    const subId = derivedPrivateKey.toString('hex').substring(0, 16);

    const filter = {
      authors: [...pubKeyOfContacts],
      kinds: [nostr.Kind.EncryptedDirectMessage],
    };

    socket.addEventListener('open', async function (e) {
      console.log('connected to ' + relay);

      const subscription = ['REQ', subId, filter];
      console.log('subscription', subscription);

      socket.send(JSON.stringify(subscription));

      resolve({
        didConnect: true,
        socket: socket,
      });
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

async function sendNostrMessage(
  socket,
  content,
  privateKey,
  pubKey,
  sendingNpub,
) {
  const event = {
    content: await encriptMessage(
      privateKey,
      '9de53da0b6fe88ccdf3b197513ce0462c325ae251aad95fd7ebfbc16a89a6801',
      content,
    ), //shared key between parties
    created_at: Math.floor(Date.now() / 1000),
    kind: 4,
    tags: [
      ['p', '9de53da0b6fe88ccdf3b197513ce0462c325ae251aad95fd7ebfbc16a89a6801'],
      ['p', pubKey],
    ], //thier pub key
  };
  const singedEvent = await getSignedEvent(event, privateKey);
  if (!singedEvent)
    return new Promise(resolve => {
      resolve(false);
    });
  else socket.send(JSON.stringify(['EVENT', singedEvent]));
}

async function encriptMessage(privkey, pubkey, text) {
  //   const encripted = await nostr.nip04.encrypt(privkey, pubkey, text);
  //   console.log(encripted);
  //   return new Promise(resolve => {
  //     resolve(encripted);
  //   });
  try {
    // return nip04.encrypt(priv, pubkey, content);

    // return;
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

export {getPubPrivateKeys, sendNostrMessage, connectToRelay, decryptMessage};
