import formatBalanceAmount from '../formatNumber';
import {getSignleContact, updateMessage} from '../../../db';
import {SATSPERBITCOIN} from '../../constants';
import functions from '@react-native-firebase/functions';

export async function publishMessage({
  toPubKey,
  fromPubKey,
  data,
  globalContactsInformation,
  selectedContact,
  fiatCurrencies,
  isLNURLPayment,
  updateFunction,
}) {
  try {
    const sendingObj = data;
    updateMessage({
      newMessage: sendingObj,
      fromPubKey,
      toPubKey,
      onlySaveToLocal: isLNURLPayment,
      updateFunction,
    });
    sendPushNotification({
      selectedContactUsername: selectedContact.uniqueName,
      myProfile: globalContactsInformation.myProfile,
      data: data,
      fiatCurrencies: fiatCurrencies,
    });
  } catch (err) {
    console.log(err), 'pubishing message to server error';
  }
}

async function sendPushNotification({
  selectedContactUsername,
  myProfile,
  data,
  // JWT,
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
    ((fiatValue[0]?.value / SATSPERBITCOIN) * (data.amountMsat / 1000)).toFixed(
      2,
    );

  console.log(devicePushKey, deviceType);

  if (!devicePushKey || !deviceType) return;
  let message;
  if (data.isRequest) {
    message = `${
      myProfile.name || myProfile.uniqueName
    } requested you ${formatBalanceAmount(
      sendingContactDenominationType != 'fiat' || !fiatAmount
        ? data.amountMsat / 1000
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
        ? data.amountMsat / 1000
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
      decryptPubKey: selectedContact.uuid,
    }),
  );

  const response = await functions().httpsCallable('contactsPushNotification')({
    devicePushKey: devicePushKey,
    deviceType: deviceType,
    message: message,
    decryptPubKey: selectedContact.uuid,
  });
  console.log(response.data);
}
