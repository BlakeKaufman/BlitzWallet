import {decryptMessage} from '.';
import * as nostr from 'nostr-tools';
import updateContactProfile from '../contacts';
import {getLocalStorageItem} from '../localStorage';

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
  if (
    !(
      userPubKey === pubkey ||
      (userPubKey != pubkey && tags[0].includes(userPubKey))
    )
  )
    return;

  const currentTime = new Date();
  const messageTime = new Date(event.created_at * 1000);
  const timeDifference = currentTime.getTime() - messageTime.getTime();
  const timeDifferenceInHours = timeDifference / (1000 * 60 * 60);

  if (!nostrContacts) return;
  content = decryptMessage(privkey, pubkey, content);
  const [filteredContact] = nostrContacts.filter(contact => {
    if (pubkey === userPubKey)
      return nostr.nip19.decode(contact.npub).data === tags[0][1];
    else return nostr.nip19.decode(contact.npub).data === pubkey;
  });

  const userTransactions = filteredContact.transactions || [];
  let userUnlookedTransactions = filteredContact.unlookedTransactions || [];
  const combinedTxList = [...userTransactions, ...userUnlookedTransactions];

  let uniqueTransactions = combinedTxList.filter(isUnique);

  const filteredTransactions =
    uniqueTransactions.filter(
      transaction =>
        transaction?.time?.toString() === event.created_at.toString(),
    ).length != 0;

  if (filteredTransactions) return;

  userUnlookedTransactions.push({content: content, time: event.created_at});

  toggleNostrContacts(
    {unlookedTransactions: userUnlookedTransactions},
    nostrContacts,
    filteredContact,
  );

  if (timeDifferenceInHours > 1) return;

  toggleNostrEvent(event);
  // if (userPubKey === pubkey) {
  // } else {

  //   // Need to check if the event is already in the transactions list. I am going to do this by checking contecnt name and paynet date to content that is already in the transacitns list
  // }
}

const isUnique = (value, index, self) =>
  self.findIndex(
    obj => obj.content === value.content && obj.time === value.time,
  ) === index;
