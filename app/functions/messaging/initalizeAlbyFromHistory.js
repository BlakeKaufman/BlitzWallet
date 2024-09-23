import {AblyRealtime} from './getToken';
import {decryptMessage, encriptMessage} from './encodingAndDecodingMessages';
import {getUnknownContact} from '../../../db';
// import getUnknownContact from '../contacts/getUnknownContact';

export async function initializeAblyFromHistory(
  updateFunction,
  globalContactsInformation,
  userPubKey,
  userPrivKey,
) {
  const decodedAddedContacts =
    typeof globalContactsInformation.addedContacts === 'string'
      ? [
          ...JSON.parse(
            decryptMessage(
              userPrivKey,
              userPubKey,
              globalContactsInformation.addedContacts,
            ),
          ),
        ]
      : [];

  try {
    const channel = AblyRealtime.channels.get(`blitzWalletPayments`);

    let receivedTransactions = {};
    const retrieveData = await channel.history();
    let historicalTransactions = retrieveData.items.filter(
      item => item.name === userPubKey,
    );

    let count = 10;

    for (let index = 0; index < count; index++) {
      if (index > historicalTransactions.length) break;
      if (!historicalTransactions[index]) break;

      const {
        data: {sendingPubKey, data, uuid, paymentType},
        name,
      } = historicalTransactions[index];

      if (!sendingPubKey || !data || !uuid) continue;

      let tempReceivedObject = receivedTransactions[sendingPubKey] || [];

      let dm = decryptMessage(userPrivKey, sendingPubKey, data);

      tempReceivedObject.push({
        data: isJSON(dm),
        from: sendingPubKey,
        uuid: uuid,
        paymentType: paymentType,
      });

      receivedTransactions[sendingPubKey] = tempReceivedObject;
      // console.log(dd, name);
    }

    const receivedHistoricalTransactionsIDS = Object.keys(receivedTransactions);

    let newAddedContacts = JSON.parse(JSON.stringify(decodedAddedContacts));

    let unseenTxCount = 0;

    for (
      let index = 0;
      index < receivedHistoricalTransactionsIDS.length;
      index++
    ) {
      const sendingUUID = receivedHistoricalTransactionsIDS[index];

      const sendingTransactions = receivedTransactions[sendingUUID];

      const indexOfAddedContact = newAddedContacts.findIndex(
        obj => obj.uuid === sendingUUID,
      );

      if (decodedAddedContacts.length === 0 || indexOfAddedContact === -1) {
        const retrivedContact = await getUnknownContact(sendingUUID);
        let newContact = {
          bio: retrivedContact.contacts.myProfile.bio || 'No bio',
          isFavorite: false,
          name: retrivedContact.contacts.myProfile.name,
          receiveAddress: retrivedContact.contacts.myProfile.receiveAddress,
          uniqueName: retrivedContact.contacts.myProfile.uniqueName,
          uuid: retrivedContact.contacts.myProfile.uuid,
          transactions: [],
          unlookedTransactions: 0,
        };

        newContact['transactions'] = sendingTransactions;
        newContact['unlookedTransactions'] = sendingTransactions.length;
        newContact['isAdded'] = false;

        newAddedContacts.push(newContact);
        unseenTxCount++;
      } else {
        let newTransactions = [];
        let unlookedTransactions = 0;

        let contact = newAddedContacts[indexOfAddedContact];

        sendingTransactions.forEach(transaction => {
          if (
            contact.transactions.filter(
              uniqueTx => uniqueTx.uuid === transaction.uuid,
            ).length === 0
          ) {
            newTransactions.push({...transaction, wasSeen: false});
            unseenTxCount++;
            unlookedTransactions++;
          }
        });
        contact['transactions'] = contact.transactions
          .concat(newTransactions)
          .sort((a, b) => a.uuid - b.uuid);
        contact['unlookedTransactions'] = unlookedTransactions;

        newAddedContacts[indexOfAddedContact] = contact;
      }
    }
    if (unseenTxCount === 0) return;

    updateFunction(
      {
        myProfile: {...globalContactsInformation.myProfile},
        addedContacts: encriptMessage(
          userPrivKey,
          userPubKey,
          JSON.stringify(newAddedContacts),
        ),
      },
      true,
    );
  } catch (err) {
    console.log(err, 'INITIALIZE ABLY');
  }
}
function isJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}
