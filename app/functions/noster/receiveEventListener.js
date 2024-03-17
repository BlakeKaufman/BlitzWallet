import {decryptMessage} from '.';
import * as nostr from 'nostr-tools';
import updateContactProfile from '../contacts';
import {getLocalStorageItem} from '../localStorage';
export default async function receiveEventListener(
  message,
  privkey,
  userPubKey,
  toggleNostrEvent,
) {
  const [type, subId, event] = JSON.parse(message.data);
  //   console.log(type, subId);
  let {kind, content, pubkey, tags} = event || {};
  if (!event || event === true) return;
  if (kind != 4) return;
  if (userPubKey === pubkey) {
    toggleNostrEvent(event);
  }
  if (!(userPubKey != pubkey && tags[0].includes(userPubKey))) return;
  content = decryptMessage(privkey, pubkey, content);
  const contacts = JSON.parse(await getLocalStorageItem('contacts'));

  const [filteredContact] = contacts.filter(contact => {
    console.log(nostr.nip19.decode(contact.npub));
    return nostr.nip19.decode(contact.npub).data === event.pubkey;
  });
  const combinedTxList =
    filteredContact.transactions && filteredContact.unlookedTransactions
      ? [
          ...filteredContact.transactions,
          ...filteredContact.unlookedTransactions,
        ]
      : filteredContact.transactions
      ? filteredContact.transactions
      : filteredContact.unlookedTransactions
      ? filteredContact.unlookedTransactions
      : [];

  const uniqueTransactions = combinedTxList.filter(isUnique);
  let newTransactions = [];

  const filteredTransactions =
    uniqueTransactions.filter(
      transaction =>
        transaction.content.toLowerCase() === content.toLowerCase() &&
        transaction?.time?.toString() === event.created_at.toString(),
    ).length != 0;

  if (!filteredTransactions) {
    newTransactions.push({content: content, time: event.created_at});
    toggleNostrEvent(event);
  }

  updateContactProfile(
    {unlookedTransactions: newTransactions},
    contacts,
    filteredContact,
  );

  // const currentTime = new Date();
  // const messageTime = new Date(event.created_at * 1000);
  // const timeDifference = currentTime.getTime() - messageTime.getTime();
  // const timeDifferenceInHours = timeDifference / (1000 * 60 * 60);

  // if (timeDifferenceInHours > 10) console.log('message', event);

  // Need to check if the event is already in the transactions list. I am going to do this by checking contecnt name and paynet date to content that is already in the transacitns list

  console.log('content:', content);
}

const isUnique = (value, index, self) =>
  self.findIndex(
    obj => obj.content === value.content && obj.time === value.time,
  ) === index;
