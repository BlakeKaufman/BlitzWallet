import {useEffect} from 'react';
import {connectToAlby} from '../functions/messaging/getToken';
import {
  decryptMessage,
  encriptMessage,
} from '../functions/messaging/encodingAndDecodingMessages';
import {useGlobalContextProvider} from '../../context-store/context';
import getUnknownContact from '../functions/contacts/getUnknownContact';
import {getPublicKey} from 'nostr-tools';
const realtime = connectToAlby();

export const listenForMessages = () => {
  const {masterInfoObject, toggleMasterInfoObject, contactsPrivateKey} =
    useGlobalContextProvider();
  const publicKey = getPublicKey(contactsPrivateKey);
  const decodedUnaddedContacts =
    typeof masterInfoObject.contacts.unaddedContacts === 'string'
      ? JSON.parse(
          decryptMessage(
            contactsPrivateKey,
            publicKey,
            masterInfoObject.contacts.unaddedContacts,
          ),
        )
      : [];
  const decodedAddedContacts =
    typeof masterInfoObject.contacts.addedContacts === 'string'
      ? JSON.parse(
          decryptMessage(
            contactsPrivateKey,
            publicKey,
            masterInfoObject.contacts.addedContacts,
          ),
        )
      : [];
  useEffect(() => {
    const channel = realtime.channels.get('blitzWalletPayments');

    channel.subscribe(masterInfoObject.contacts.myProfile.uuid, async e => {
      const {
        data: {sendingPubKey, data, uuid, paymentType},
        name,
      } = e;

      let dm = decryptMessage(contactsPrivateKey, sendingPubKey, data);

      dm = isJSON(dm);

      if (!sendingPubKey) return;

      if (
        decodedAddedContacts.filter(contact => contact.uuid === sendingPubKey)
          .length === 0
      ) {
        if (decodedUnaddedContacts.length === 0) {
          let contact = await getUnknownContact(sendingPubKey);

          contact['unlookedTransactions'] = [
            {
              data: dm,
              from: sendingPubKey,
              uuid: uuid,
              paymentType: paymentType,
            },
          ];
          contact['isAdded'] = false;

          toggleMasterInfoObject({
            contacts: {
              myProfile: {...masterInfoObject.contacts.myProfile},
              addedContacts:
                typeof masterInfoObject.contacts.addedContacts === 'string'
                  ? masterInfoObject.contacts.addedContacts
                  : [],
              unaddedContacts: encriptMessage(
                contactsPrivateKey,
                publicKey,
                JSON.stringify([contact]),
              ),
            },
          });
        } else {
          const newUnaddedContact = decodedUnaddedContacts.map(contact => {
            if (contact.uuid === sendingPubKey) {
              contact['unlookedTransactions'] = contact[
                'unlookedTransactions'
              ].concat([
                {
                  data: dm,
                  from: sendingPubKey,
                  uuid: uuid,
                  paymentType: paymentType,
                },
              ]);
              return contact;
            } else return contact;
          });

          toggleMasterInfoObject({
            contacts: {
              myProfile: {...masterInfoObject.contacts.myProfile},
              addedContacts:
                typeof masterInfoObject.contacts.addedContacts === 'string'
                  ? masterInfoObject.contacts.addedContacts
                  : [],
              unaddedContacts: encriptMessage(
                contactsPrivateKey,
                publicKey,
                JSON.stringify(newUnaddedContact),
              ),
            },
          });
        }
      } else {
        const newAddedContact = decodedAddedContacts.map(contact => {
          if (contact.uuid === sendingPubKey) {
            contact['unlookedTransactions'] = contact[
              'unlookedTransactions'
            ].concat([
              {
                data: dm,
                from: sendingPubKey,
                uuid: uuid,
                paymentType: paymentType,
              },
            ]);

            return contact;
          } else return contact;
        });

        toggleMasterInfoObject({
          contacts: {
            myProfile: {...masterInfoObject.contacts.myProfile},
            addedContacts: encriptMessage(
              contactsPrivateKey,
              publicKey,
              JSON.stringify(newAddedContact),
            ),
            unaddedContacts:
              typeof masterInfoObject.contacts.unaddedContacts === 'string'
                ? masterInfoObject.contacts.unaddedContacts
                : [],
          },
        });
      }
    });
  }, []);
};

function isJSON(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
}
