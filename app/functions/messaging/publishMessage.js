import {AblyRealtime} from './getToken';
import {encriptMessage} from './encodingAndDecodingMessages';

export async function pubishMessageToAbly(
  fromPrivKey,
  toPubKey,
  fromPubKey,
  data,
  globalContactsInformation,
  toggleGlobalContactsInformation,
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

    toggleGlobalContactsInformation(
      {
        myProfile: {...globalContactsInformation.myProfile},
        addedContacts: encriptMessage(
          fromPrivKey,
          sendingPublicKey,
          JSON.stringify(newAddedContact),
        ),
        // unaddedContacts:
        //   typeof globalContactsInformation.unaddedContacts === 'string'
        //     ? globalContactsInformation.unaddedContacts
        //     : [],
      },
      true,
    );
  } catch (err) {
    console.log(err);
  }
}
