import {useEffect} from 'react';
import {connectToAlby} from '../functions/messaging/getToken';
import {decryptMessage} from '../functions/messaging/encodingAndDecodingMessages';
import {useGlobalContextProvider} from '../../context-store/context';
import getUnknownContact from '../functions/contacts/getUnknownContact';
const realtime = connectToAlby();

export const listenForMessages = () => {
  const {masterInfoObject, toggleMasterInfoObject, contactsPrivateKey} =
    useGlobalContextProvider();
  useEffect(() => {
    const channel = realtime.channels.get('blitzWalletPayments');

    channel.subscribe(masterInfoObject.contacts.myProfile.uuid, e => {
      const {
        data: {sendingPubKey, data, uuid, paymentType},
        name,
      } = e;

      let dm = decryptMessage(contactsPrivateKey, sendingPubKey, data);

      dm = isJSON(dm) || dm;

      if (!sendingPubKey) return;
      if (
        masterInfoObject.contacts.addedContacts.filter(
          contact => contact.uuid === sendingPubKey,
        ).length === 0
      ) {
        let unaddedContacts = masterInfoObject.contacts.unaddedContacts;
        if (unaddedContacts.length === 0) {
          (async () => {
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
                addedContacts: [...masterInfoObject.contacts.addedContacts],
                unaddedContacts: [contact],
              },
            });
          })();
          return;
        } else {
          const newUnaddedContact = [
            ...masterInfoObject.contacts.unaddedContacts,
          ].map(contact => {
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
              addedContacts: [...masterInfoObject.contacts.addedContacts],
              unaddedContacts: newUnaddedContact,
            },
          });
        }
      } else {
        const newAddedContact = [
          ...masterInfoObject.contacts.addedContacts,
        ].map(contact => {
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
            addedContacts: newAddedContact,
            unaddedContacts: [...masterInfoObject.contacts.unaddedContacts],
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
    return false;
  }
}
