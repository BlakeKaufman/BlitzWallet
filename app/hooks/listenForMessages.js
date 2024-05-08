import {useEffect, useState} from 'react';
import {AblyRealtime, connectToAlby} from '../functions/messaging/getToken';
import {
  decryptMessage,
  encriptMessage,
} from '../functions/messaging/encodingAndDecodingMessages';
import {useGlobalContextProvider} from '../../context-store/context';
import getUnknownContact from '../functions/contacts/getUnknownContact';
import {getPublicKey} from 'nostr-tools';
import {ContractABIs} from 'boltz-core';
// const realtime = connectToAlby();

export const listenForMessages = () => {
  console.log('LISTENING FUNCTION RUNNING');
  const {masterInfoObject, toggleMasterInfoObject, contactsPrivateKey} =
    useGlobalContextProvider();
  const [inboundMessage, setInboundMessage] = useState(null);
  const publicKey = getPublicKey(contactsPrivateKey);
  // const decodedUnaddedContacts =
  //   typeof masterInfoObject.contacts.unaddedContacts === 'string'
  //     ? JSON.parse(
  //         decryptMessage(
  //           contactsPrivateKey,
  //           publicKey,
  //           masterInfoObject.contacts.unaddedContacts,
  //         ),
  //       )
  //     : [];
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
    if (!inboundMessage) return;
    console.log(inboundMessage);
    const {dm, sendingPubKey, uuid, paymentType} = inboundMessage;

    const isUnkownContact =
      decodedAddedContacts.filter(contact => contact.uuid === sendingPubKey)
        .length === 0;

    if (isUnkownContact) {
      (async () => {
        let contact = await getUnknownContact(sendingPubKey);
        let newAddedContacts = [...decodedAddedContacts];

        contact['transactions'] = [
          {
            data: dm,
            from: sendingPubKey,
            uuid: uuid,
            paymentType: paymentType,
          },
        ];
        contact['unlookedTransactions'] = 1;
        contact['isAdded'] = false;

        newAddedContacts.push(contact);

        toggleMasterInfoObject({
          contacts: {
            myProfile: {...masterInfoObject.contacts.myProfile},
            addedContacts: encriptMessage(
              contactsPrivateKey,
              publicKey,
              JSON.stringify(newAddedContacts),
            ),
            // unaddedContacts: encriptMessage(
            //   contactsPrivateKey,
            //   publicKey,
            //   JSON.stringify(newAddedContacts),
            // ),
          },
        });
      })();
    } else {
      let newAddedContact = [...decodedAddedContacts];
      const indexOfContact = decodedAddedContacts.findIndex(
        obj => obj.uuid === sendingPubKey,
      );

      let contact = newAddedContact[indexOfContact];

      contact['transactions'] = contact['transactions'].concat([
        {
          data: dm,
          from: sendingPubKey,
          uuid: uuid,
          paymentType: paymentType,
        },
      ]);
      contact['unlookedTransactions'] = contact['unlookedTransactions'] + 1;

      newAddedContact[indexOfContact] = contact;

      toggleMasterInfoObject({
        contacts: {
          myProfile: {...masterInfoObject.contacts.myProfile},
          addedContacts: encriptMessage(
            contactsPrivateKey,
            publicKey,
            JSON.stringify(newAddedContact),
          ),
          //   unaddedContacts:
          //     typeof masterInfoObject.contacts.unaddedContacts === 'string'
          //       ? masterInfoObject.contacts.unaddedContacts
          //       : [],
        },
      });
    }
  }, [inboundMessage]);

  useEffect(() => {
    const channel = AblyRealtime.channels.get('blitzWalletPayments');

    channel.subscribe(masterInfoObject.contacts.myProfile.uuid, e => {
      const {
        data: {sendingPubKey, data, uuid, paymentType},
        name,
      } = e;

      let dm = decryptMessage(contactsPrivateKey, sendingPubKey, data);

      dm = isJSON(dm);

      if (!sendingPubKey) return;

      setInboundMessage({
        dm: dm,
        sendingPubKey: sendingPubKey,
        uuid: uuid,
        paymentType: paymentType,
      });

      return;
      const isUnkownContact =
        decodedAddedContacts.filter(contact => contact.uuid === sendingPubKey)
          .length === 0;

      if (isUnkownContact) {
        (async () => {
          let contact = await getUnknownContact(sendingPubKey);
          let newAddedContacts = [...decodedAddedContacts];

          contact['transactions'] = [
            {
              data: dm,
              from: sendingPubKey,
              uuid: uuid,
              paymentType: paymentType,
            },
          ];
          contact['unlookedTransactions'] = 1;
          contact['isAdded'] = false;

          newAddedContacts.push(contact);

          toggleMasterInfoObject({
            contacts: {
              myProfile: {...masterInfoObject.contacts.myProfile},
              addedContacts: encriptMessage(
                contactsPrivateKey,
                publicKey,
                JSON.stringify(newAddedContacts),
              ),
              // unaddedContacts: encriptMessage(
              //   contactsPrivateKey,
              //   publicKey,
              //   JSON.stringify(newAddedContacts),
              // ),
            },
          });
        })();
        // if (true) {
        //   const newUnaddedContact = decodedUnaddedContacts.map(contact => {
        //     if (contact.uuid === sendingPubKey) {
        //       contact['transactions'] = contact['transactions'].concat([
        //         {
        //           data: dm,
        //           from: sendingPubKey,
        //           uuid: uuid,
        //           paymentType: paymentType,
        //         },
        //       ]);
        //       contact['unlookedTransactions'] =
        //         contact['unlookedTransactions'] + 1;
        //       return contact;
        //     } else return contact;
        //   });

        //   toggleMasterInfoObject({
        //     contacts: {
        //       myProfile: {...masterInfoObject.contacts.myProfile},
        //       addedContacts:
        //         typeof masterInfoObject.contacts.addedContacts === 'string'
        //           ? masterInfoObject.contacts.addedContacts
        //           : [],
        //       unaddedContacts: encriptMessage(
        //         contactsPrivateKey,
        //         publicKey,
        //         JSON.stringify(newUnaddedContact),
        //       ),
        //     },
        //   });
        // }
      } else {
        const newAddedContact = decodedAddedContacts.map(contact => {
          if (contact.uuid === sendingPubKey) {
            contact['transactions'] = contact['transactions'].concat([
              {
                data: dm,
                from: sendingPubKey,
                uuid: uuid,
                paymentType: paymentType,
              },
            ]);
            contact['unlookedTransactions'] =
              contact['unlookedTransactions'] + 1;
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
            //   unaddedContacts:
            //     typeof masterInfoObject.contacts.unaddedContacts === 'string'
            //       ? masterInfoObject.contacts.unaddedContacts
            //       : [],
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
