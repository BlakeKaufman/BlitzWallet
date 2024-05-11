import {AblyRealtime, connectToAlby} from './getToken';
import {decryptMessage, encriptMessage} from './encodingAndDecodingMessages';
import getUnknownContact from '../contacts/getUnknownContact';

// const realtime = connectToAlby();

export async function initializeAblyFromHistory(
  updateFunction,
  masterInfoObject,
  userPubKey,
  userPrivKey,
) {
  const decodedAddedContacts =
    typeof masterInfoObject.contacts.addedContacts === 'string'
      ? [
          ...JSON.parse(
            decryptMessage(
              userPrivKey,
              userPubKey,
              masterInfoObject.contacts.addedContacts,
            ),
          ),
        ]
      : [];

  try {
    const channel = AblyRealtime.channels.get(`blitzWalletPayments`);

    let receivedTransactions = {};
    let historicalTransactions = (await channel.history()).items.filter(
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

    let newAddedContacts = [...decodedAddedContacts];
    let unseenTxCount = 0;

    for (
      let index = 0;
      index < Object.keys(receivedTransactions).length;
      index++
    ) {
      const sendingUUID = receivedHistoricalTransactionsIDS[index];

      const sendingTransactions = receivedTransactions[sendingUUID];
      console.log(sendingUUID, sendingTransactions);

      if (decodedAddedContacts.length === 0) {
        console.log('NO CONTACTS');
        let newContact = await getUnknownContact(sendingUUID);

        newContact['transactions'] = sendingTransactions;
        newContact['unlookedTransactions'] = sendingTransactions.length;
        newContact['isAdded'] = false;

        newAddedContacts.push(newContact);
        unseenTxCount++;
      } else {
        const indexOfAddedContact = newAddedContacts.findIndex(
          obj => obj.uuid === sendingUUID,
        );
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

    updateFunction({
      contacts: {
        myProfile: {...masterInfoObject.contacts.myProfile},
        addedContacts: encriptMessage(
          userPrivKey,
          userPubKey,
          JSON.stringify(newAddedContacts),
        ),
      },
    });
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
