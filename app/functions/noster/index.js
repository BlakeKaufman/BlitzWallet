import {generateSecureRandom} from 'react-native-securerandom';

import {deleteItem, retrieveData, storeData} from '../secureStore';

// import crypto from 'expo-crypto';
import * as secp from '@noble/secp256k1';
import * as nostr from 'nostr-tools';
import * as crypto from 'react-native-quick-crypto';
import generateMnemnoic from '../seed';
import {btoa, atob, toByteArray} from 'react-native-quick-base64';
import {useGlobalContextProvider} from '../../../context-store/context';
import updateContactProfile from '../contacts';
import {getLocalStorageItem} from '../localStorage';

async function getPubPrivateKeys() {
  try {
    const mnemonic = (await retrieveData('mnemonic'))
      .split(' ')
      .filter(word => word.length > 0)
      .join(' ');

    console.log(mnemonic);

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

    return new Promise(resolve => {
      resolve([decodeNpub, decodeNsec, npub, nsec]);
    });
  } catch (err) {
    console.log(err);
  }
}

async function generateNostrProfile() {
  const [decodeNpub, decodeNsec, npub, nsec] = await getPubPrivateKeys();

  const didSave = await storeData(
    'myNostrProfile',
    JSON.stringify({
      npub: npub,
      pubKey: decodeNpub,
      nsec: nsec,
      privKey: decodeNsec,
    }),
  );

  return new Promise(resolve => {
    resolve({
      npub: npub,
      pubKey: decodeNpub,
      nsec: nsec,
      privKey: decodeNsec,
    });
  });
}

// this will return events and then you decript messages outside of funciton
async function connectToRelay(
  pubKeyOfContacts,
  privateKey,
  pubkey,
  receiveEventListener,
  toggleNostrSocket,
  toggleNostrEvent,
  toggleNostrContacts,
  nostrContacts,
) {
  const relay = 'wss://relay.damus.io';
  const socket = new WebSocket(relay);

  socket.addEventListener('message', message => {
    receiveEventListener(
      message,
      privateKey,
      pubkey,
      toggleNostrEvent,
      toggleNostrContacts,
      nostrContacts,
    );
  });

  const randomBytesArray = await generateSecureRandom(32);
  const derivedPrivateKey = Buffer.from(randomBytesArray);
  // Create a public key from the private key

  const subId = derivedPrivateKey.toString('hex').substring(0, 16);

  const filter = pubKeyOfContacts
    ? {
        authors: [...pubKeyOfContacts, pubkey],
        kinds: [nostr.Kind.EncryptedDirectMessage],
      }
    : {
        authors: [pubkey],
        kinds: [nostr.Kind.EncryptedDirectMessage],
      };

  socket.addEventListener('open', async function (e) {
    console.log('connected to ' + relay);

    const subscription = ['REQ', subId, filter];
    console.log('subscription', subscription);

    socket.send(JSON.stringify(subscription));

    toggleNostrSocket(socket);
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
  sendingNpub,
  toggleNostrEvents,
  toggleNostrContacts,
  nostrContacts,
) {
  const decodedNpub = nostr.nip19.decode(sendingNpub).data;
  const [selectedContact] = nostrContacts?.filter(
    contact => contact.npub === sendingNpub,
  );
  let transactions = selectedContact.transactions || [];
  const time = Math.floor(Date.now() / 1000);
  const event = {
    content: await encriptMessage(privateKey, decodedNpub, content), //shared key between parties
    created_at: time,
    kind: 4,
    tags: [
      ['p', decodedNpub],
      //   ['p', pubKey],
    ], //thier pub key
  };
  const singedEvent = await getSignedEvent(event, privateKey);
  if (!singedEvent)
    return new Promise(resolve => {
      resolve(false);
    });
  else {
    socket.send(JSON.stringify(['EVENT', singedEvent]));
    transactions.push({
      content: content,
      time: time,
      wasSeen: false,
      wasSent: true,
    });
    toggleNostrContacts(
      {transactions: transactions},
      nostrContacts,
      selectedContact,
    );
  }
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

async function getConnectToRelayInfo() {
  const hasNostrProfile = JSON.parse(await retrieveData('myNostrProfile'));
  const contacts = JSON.parse(await getLocalStorageItem('contacts'));

  console.log(hasNostrProfile, contacts);

  const generatedNostrProfile =
    hasNostrProfile || (await generateNostrProfile());
  console.log(generatedNostrProfile);

  const pubKeyOfContacts =
    contacts &&
    contacts.map(contact => {
      return nostr.nip19.decode(contact.npub).data;
    });
  console.log(pubKeyOfContacts, contacts, generatedNostrProfile);

  return new Promise(resolve => {
    resolve([generatedNostrProfile, pubKeyOfContacts]);
  });
}
export {
  getPubPrivateKeys,
  sendNostrMessage,
  connectToRelay,
  decryptMessage,
  generateNostrProfile,
  getConnectToRelayInfo,
};
