import {AblyRealtime, connectToAlby} from './getToken';
import crypto from 'crypto';
import {Buffer} from 'buffer';
import {retrieveData, storeData} from '../secureStore';
import {encriptMessage} from './encodingAndDecodingMessages';

// const realtime = connectToAlby();
export async function pubishMessageToAbly(
  fromPrivKey,
  toPubKey,
  fromPubKey,
  data,
  masterInfoObject,
  toggleMasterInfoObject,
  paymentType,
  decodedContacts,
  sendingPublicKey,
) {
  try {
    const channel = AblyRealtime.channels.get('blitzWalletPayments');

    const em = encriptMessage(fromPrivKey, toPubKey, data);

    const uuid = Math.floor(Date.now() / 1000);

    // Need to add the message to the corresponding addedContact transactoins so that the sent transactions are also saved.

    await channel.publish(toPubKey, {
      sendingPubKey: fromPubKey,
      data: em,
      uuid: uuid,
      paymentType: paymentType,
    });

    let newAddedContact = [...decodedContacts];
    const indexOfContact = decodedContacts.findIndex(
      obj => obj.uuid === toPubKey,
    );

    let contact = newAddedContact[indexOfContact];

    contact['transactions'] = contact.transactions.concat([
      {
        sendingPubKey: fromPubKey,
        data: JSON.parse(data),
        uuid: uuid,
        wasSent: true,
      },
    ]);

    newAddedContact[indexOfContact] = contact;

    // const newAddedContact = decodedContacts.map(contact => {
    //   if (contact.uuid === toPubKey) {
    //     contact['transactions'] = contact.transactions.concat([
    //       {
    //         sendingPubKey: fromPubKey,
    //         data: JSON.parse(data),
    //         uuid: uuid,
    //         wasSent: true,
    //       },
    //     ]);
    //     return contact;
    //   } else return contact;
    // });

    toggleMasterInfoObject({
      contacts: {
        myProfile: {...masterInfoObject.contacts.myProfile},
        addedContacts: encriptMessage(
          fromPrivKey,
          sendingPublicKey,
          JSON.stringify(newAddedContact),
        ),
        // unaddedContacts:
        //   typeof masterInfoObject.contacts.unaddedContacts === 'string'
        //     ? masterInfoObject.contacts.unaddedContacts
        //     : [],
      },
    });
  } catch (err) {
    console.log(err);
  }
}
