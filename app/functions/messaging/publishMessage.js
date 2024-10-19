import {AblyRealtime} from './getToken';
import {encriptMessage} from './encodingAndDecodingMessages';
import formatBalanceAmount from '../formatNumber';
import {getSignleContact} from '../../../db';
import getGiftCardAPIEndpoint from '../../components/admin/homeComponents/apps/giftCards/getGiftCardAPIEndpoint';
import {SATSPERBITCOIN} from '../../constants';

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
  JWT,
  fiatCurrencies,
) {
  try {
    const uuid = Math.floor(Date.now() / 1000);
    let newAddedContact = JSON.parse(JSON.stringify(decodedContacts));
    const indexOfContact = decodedContacts.findIndex(
      obj => obj.uuid === toPubKey,
    );

    console.log(indexOfContact);

    let contact = newAddedContact[indexOfContact];

    console.log(contact);

    contact['transactions'] = contact.transactions.concat([
      {
        sendingPubKey: fromPubKey,
        data: JSON.parse(data),
        uuid: uuid,
        wasSent: true,
      },
    ]);

    newAddedContact[indexOfContact] = contact;

    console.log(newAddedContact);

    if (selectedContact.isLNURL) {
      toggleGlobalContactsInformation(
        {
          myProfile: {...globalContactsInformation.myProfile},
          addedContacts: encriptMessage(
            fromPrivKey,
            sendingPublicKey,
            JSON.stringify(newAddedContact),
          ),
        },
        true,
      );
      return;
    }

    const channel = AblyRealtime.channels.get('blitzWalletPayments');

    const em = encriptMessage(fromPrivKey, toPubKey, data);

    // Need to add the message to the corresponding addedContact transactoins so that the sent transactions are also saved.

    await channel.publish(toPubKey, {
      sendingPubKey: fromPubKey,
      data: em,
      uuid: uuid,
      paymentType: paymentType,
    });

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
      JWT: JWT,
      fiatCurrencies: fiatCurrencies,
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
  JWT,
  fiatCurrencies,
}) {
  console.log(selectedContactUsername);
  const retrivedContact = await getSignleContact(
    selectedContactUsername.toLowerCase(),
  );

  if (retrivedContact.length === 0) return;
  const [selectedContact] = retrivedContact;

  const devicePushKey = selectedContact?.pushNotifications?.key?.encriptedText;
  const deviceType = selectedContact?.pushNotifications?.platform;
  const sendingContactFiatCurrency = selectedContact?.fiatCurrency || 'USD';
  const sendingContactDenominationType =
    selectedContact?.userBalanceDenomination || 'sats';

  const fiatValue = fiatCurrencies.filter(
    currency =>
      currency.coin.toLowerCase() === sendingContactFiatCurrency.toLowerCase(),
  );
  const didFindCurrency = fiatValue.length >= 1;
  const fiatAmount =
    didFindCurrency &&
    (
      (fiatValue[0]?.value / SATSPERBITCOIN) *
      (JSON.parse(data).amountMsat / 1000)
    ).toFixed(2);

  console.log(devicePushKey, deviceType);

  if (!devicePushKey || !deviceType) return;
  let message;
  if (JSON.parse(data).isRequest) {
    message = `${
      myProfile.name || myProfile.uniqueName
    } requested you ${formatBalanceAmount(
      sendingContactDenominationType != 'fiat' || !fiatAmount
        ? JSON.parse(data).amountMsat / 1000
        : fiatAmount,
    )} ${
      sendingContactDenominationType != 'fiat' || !fiatAmount
        ? 'sats'
        : sendingContactFiatCurrency
    }`;
  } else {
    message = `${
      myProfile.name || myProfile.uniqueName
    } paid you ${formatBalanceAmount(
      sendingContactDenominationType != 'fiat' || !fiatAmount
        ? JSON.parse(data).amountMsat / 1000
        : fiatAmount,
    )} ${
      sendingContactDenominationType != 'fiat' || !fiatAmount
        ? 'sats'
        : sendingContactFiatCurrency
    }`;
  }

  console.log(
    JSON.stringify({
      devicePushKey: devicePushKey,
      deviceType: deviceType,
      message: message,
      token: JWT,
    }),
  );
  const response = await fetch(
    `https://blitz-wallet.com/.netlify/functions/contactsPushNotification`,
    {
      method: 'POST', // Specify the HTTP method
      headers: {
        'Content-Type': 'application/json', // Set the content type to JSON
      },
      body: JSON.stringify({
        devicePushKey: devicePushKey,
        deviceType: deviceType,
        message: message,
        token: JWT,
      }),
    },
  );
  const postData = await response.json();
  console.log(postData);
}
