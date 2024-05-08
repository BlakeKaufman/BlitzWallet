import {limit} from 'firebase/firestore';
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
  // const decodedUnaddedContacts =
  //   typeof masterInfoObject.contacts.unaddedContacts === 'string'
  //     ? JSON.parse(
  //         decryptMessage(
  //           userPrivKey,
  //           userPubKey,
  //           masterInfoObject.contacts.unaddedContacts,
  //         ),
  //       )
  //     : [];

  try {
    // if (
    //   decodedAddedContacts.length === 0 //&&
    //   // decodedUnaddedContacts.length === 0
    // )
    //   return;
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

    console.log(Object.keys(receivedTransactions));

    const receivedHistoricalTransactionsIDS = Object.keys(receivedTransactions);

    let newAddedContacts = [];
    let unseenTxCount = 0;

    for (
      let index = 0;
      index < Object.keys(receivedTransactions).length;
      index++
    ) {
      const sendingUUID = receivedHistoricalTransactionsIDS[index];
      console.log(sendingUUID);
      const sendingTransactions = receivedTransactions[sendingUUID];
      console.log(decodedAddedContacts.length, 'DESFD');

      if (decodedAddedContacts.length === 0) {
        console.log('NO CONTACTS');
        let newContact = await getUnknownContact(sendingUUID);

        newContact['transactions'] = sendingTransactions;
        newContact['unlookedTransactions'] = sendingTransactions.length;
        newContact['isAdded'] = false;

        newAddedContacts.push(newContact);
        unseenTxCount++;
        continue;
      }

      decodedAddedContacts.forEach(masterContact => {
        let newTransactions = [];
        let unlookedTransactions = 0;
        if (masterContact.uuid === sendingUUID) {
          sendingTransactions.forEach(transaction => {
            if (
              masterContact.transactions.filter(
                uniqueTx => uniqueTx.uuid === transaction.uuid,
              ).length === 0
            ) {
              newTransactions.push({...transaction, wasSeen: false});
              unseenTxCount++;
              unlookedTransactions++;
            }
          });
          newAddedContacts.push({
            ...masterContact,
            transactions: masterContact.transactions
              .concat(newTransactions)
              .sort((a, b) => a.uuid - b.uuid),
            unlookedTransactions: unlookedTransactions,
          });
        } else newAddedContacts.push(masterContact);

        // const contactsIndexOfSender = decodedAddedContacts.findIndex(
        //   obj => obj.uuid === sendingUUID,
        // );

        // let contact = decodedAddedContacts[contactsIndexOfSender];
        // sendingTransactions.forEach(transaction => {
        //   if (
        //     contact.transactions.filter(
        //       uniqueTx => uniqueTx.uuid === transaction.uuid,
        //     ).length === 0
        //   ) {
        //     newTransactions.push({...transaction, wasSeen: false});
        //     unseenTxCount++;
        //     unlookedTransactions++;
        //   }
        // });

        // contact['transactions'] = newTransactions;
        // contact['unlookedTransaction'] = unlookedTransactions;

        // decodedAddedContacts[contactsIndexOfSender] = contact;

        // console.log(
        //   contactsIndexOfSender,
        // );

        // console.log(transactionData);
      });
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
        // unaddedContacts:
        //   typeof masterInfoObject.contacts.unaddedContacts === 'string'
        //     ? masterInfoObject.contacts.unaddedContacts
        //     : [],
      },
    });

    return;

    // let newAddedContacts = [];
    // let unseenTxCount = 0;

    for (
      let addedContactIndex = 0;
      addedContactIndex < decodedAddedContacts.length;
      addedContactIndex++
    ) {
      const contact = JSON.parse(
        JSON.stringify(decodedAddedContacts[addedContactIndex]),
      ); // Deep copy
      let newTransactions = [...contact.transactions];
      let unlookedTransactions = 0;

      for (
        let index = 0;
        index < Object.keys(receivedTransactions).length;
        index++
      ) {
        const transactions =
          receivedTransactions[Object.keys(receivedTransactions)[index]];
        const historicalTxUUIDGrouping =
          Object.keys(receivedTransactions)[index];

        if (contact.uuid != historicalTxUUIDGrouping) continue;

        transactions.forEach(transaction => {
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
      }

      newAddedContacts.push({
        ...contact,
        transactions: newTransactions.sort((a, b) => a.uuid - b.uuid),
        unlookedTransactions: unlookedTransactions,
      });
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
        // unaddedContacts:
        //   typeof masterInfoObject.contacts.unaddedContacts === 'string'
        //     ? masterInfoObject.contacts.unaddedContacts
        //     : [],
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
function combineUniqueObjects(arr1, arr2, prop) {
  const combinedSet = new Set(arr1.map(item => item[prop])); // Create a Set of unique values based on the specified property
  arr2.forEach(item => {
    // Loop through the second array
    if (!combinedSet.has(item[prop])) {
      // Check if the Set does not already contain the property value
      arr1.push(item); // If not, add the item to the first array
      combinedSet.add(item[prop]); // Also add the property value to the Set
    }
  });
  return arr1; // Return the combined array
}
