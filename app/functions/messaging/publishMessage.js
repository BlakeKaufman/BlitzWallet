import {AblyRealtime} from './getToken';
import {encriptMessage} from './encodingAndDecodingMessages';
import formatBalanceAmount from '../formatNumber';
import {getSignleContact} from '../../../db';
import getGiftCardAPIEndpoint from '../../components/admin/homeComponents/apps/giftCards/getGiftCardAPIEndpoint';

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
  selectedContact,
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
    sendPushNotification({
      selectedContactUsername: selectedContact.uniqueName,
      myProfile: globalContactsInformation.myProfile,
      data: data,
    });

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

async function sendPushNotification({
  selectedContactUsername,
  myProfile,
  data,
}) {
  console.log(selectedContactUsername);
  const retrivedContact = await getSignleContact(
    selectedContactUsername.toLowerCase(),
  );

  if (retrivedContact.length === 0) return;
  const [selectedContact] = retrivedContact;

  const devicePushKey = selectedContact?.pushNotifications?.key?.encriptedText;
  const deviceType = selectedContact?.pushNotifications?.platform;

  console.log(devicePushKey, deviceType);

  if (!devicePushKey || !deviceType) return;
  let message;
  if (JSON.parse(data).isRequest) {
    message = `${myProfile.uniqueName} requested you ${formatBalanceAmount(
      JSON.parse(data).amountMsat / 1000,
    )} sats`;
  } else {
    message = `${myProfile.uniqueName} paid you ${formatBalanceAmount(
      JSON.parse(data).amountMsat / 1000,
    )} sats`;
  }

  await fetch(
    `${getGiftCardAPIEndpoint()}.netlify/functions/contactsPushNotification`,
    {
      method: 'POST', // Specify the HTTP method
      headers: {
        'Content-Type': 'application/json', // Set the content type to JSON
      },
      body: JSON.stringify({
        devicePushKey: devicePushKey,
        deviceType: deviceType,
        message: message,
      }),
    },
  );
}
