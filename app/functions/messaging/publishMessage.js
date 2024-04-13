import {connectToAlby} from './getToken';
import crypto from 'crypto';
import {Buffer} from 'buffer';
import {retrieveData, storeData} from '../secureStore';
import {encriptMessage} from './encodingAndDecodingMessages';

export async function pubishMessageToAbly(
  fromPrivKey,
  toPubKey,
  fromPubKey,
  data,
  masterInfoObject,
  toggleMasterInfoObject,
  paymentType,
) {
  try {
    const realtime = connectToAlby();

    const channel = realtime.channels.get('blitzWalletPayments');

    const em = encriptMessage(fromPrivKey, toPubKey, data);

    const uuid = Math.floor(Date.now() / 1000);

    // Need to add the message to the corresponding addedContact transactoins so that the sent transactions are also saved.

    await channel.publish(toPubKey, {
      sendingPubKey: fromPubKey,
      data: em,
      uuid: uuid,
      paymentType: paymentType,
    });

    const newAddedContact = [...masterInfoObject.contacts.addedContacts].map(
      contact => {
        if (contact.uuid === toPubKey) {
          contact['transactions'] = contact.transactions.concat([
            {
              sendingPubKey: fromPubKey,
              data: JSON.parse(data),
              uuid: uuid,
              wasSent: true,
            },
          ]);
          return contact;
        } else return contact;
      },
    );

    toggleMasterInfoObject({
      contacts: {
        myProfile: {...masterInfoObject.contacts.myProfile},
        addedContacts: newAddedContact,
      },
    });
  } catch (err) {
    console.log(err);
  }
}
