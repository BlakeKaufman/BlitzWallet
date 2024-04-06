import {decryptMessage} from '.';
import * as nostr from 'nostr-tools';

export default async function receiveEventListener(
  message,
  privkey,
  userPubKey,
  toggleNostrEvent,
  toggleNostrContacts,
  nostrContacts,
) {
  const [type, subId, event] = JSON.parse(message.data);
  //   console.log(type, subId);
  let {kind, content, pubkey, tags} = event || {};
  if (!event || event === true) return;
  if (kind != 4) return;
  if (!(userPubKey != pubkey && tags[0].includes(userPubKey))) return;

  // const currentTime = new Date();
  // const messageTime = new Date(event.created_at * 1000);
  // const timeDifference = currentTime.getTime() - messageTime.getTime();
  // const timeDifferenceInHours = timeDifference / (1000 * 60 * 60);

  if (!nostrContacts) return;

  content = decryptMessage(privkey, pubkey, content);
  const [filteredContact] = nostrContacts.filter(contact => {
    if (pubkey === userPubKey)
      return nostr.nip19.decode(contact.npub).data === tags[0][1];
    else return nostr.nip19.decode(contact.npub).data === pubkey;
  });

  const userTransactions = filteredContact?.transactions || [];
  let userUnlookedTransactions = filteredContact?.unlookedTransactions || [];
  const combinedTxList = [...userTransactions, ...userUnlookedTransactions];

  let uniqueTransactions = combinedTxList.filter((obj, index, self) => {
    return index === self.findIndex(o => isEqual(o, obj));
  });

  const currentTransaction = isJSON(content) || content;

  // console.log(uniqueTransactions);

  const filteredTransactions = uniqueTransactions.filter(transaction => {
    const parsedContent = isJSON(transaction.content) || transaction.content;
    const parsedTime = isJSON(transaction.time) || transaction.time;
    const parsedTx = {...parsedContent, ...parsedTime};

    return parsedTx.id === currentTransaction.id;
  });

  if (filteredTransactions.length != 0) return;

  userPubKey === pubkey
    ? userUnlookedTransactions.push({
        content: {...currentTransaction, wasSeen: true},
        time: event.created_at,
      })
    : userUnlookedTransactions.push({
        content: currentTransaction,
        time: event.created_at,
      });

  toggleNostrContacts(
    {unlookedTransactions: userUnlookedTransactions},
    nostrContacts,
    filteredContact,
  );
}
function isEqual(obj1, obj2) {
  const parsedOBJ = isJSON(obj1.content) || obj1.content;
  const parsedVal = isJSON(obj2.content) || obj2.content;

  return parsedOBJ.id === parsedVal.id;
}

function isJSON(data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    return false;
  }
}
