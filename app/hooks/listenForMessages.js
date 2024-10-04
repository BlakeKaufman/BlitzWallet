import {useEffect, useState} from 'react';
import {AblyRealtime} from '../functions/messaging/getToken';
import {
  decryptMessage,
  encriptMessage,
} from '../functions/messaging/encodingAndDecodingMessages';
import {getUnknownContact} from '../../db';
// import getUnknownContact from '../functions/contacts/getUnknownContact';

export const useListenForMessages = ({
  didGetToHomepage,
  contactsPrivateKey,
  decodedAddedContacts,
  toggleGlobalContactsInformation,
  globalContactsInformation,
  publicKey,
}) => {
  console.log('LISTENING FUNCTION RUNNING');

  const [inboundMessage, setInboundMessage] = useState(null);

  useEffect(() => {
    if (!didGetToHomepage) return;
    if (!inboundMessage) return;

    console.log(inboundMessage, 'INVOUND MESSAGE');
    const {dm, sendingPubKey, uuid, paymentType} = inboundMessage;

    const isUnkownContact =
      decodedAddedContacts.filter(contact => contact.uuid === sendingPubKey)
        .length === 0;

    if (isUnkownContact) {
      (async () => {
        const retrivedContact = await getUnknownContact(sendingPubKey);
        let newContact = {
          bio: retrivedContact.contacts.myProfile.bio || 'No bio',
          isFavorite: false,
          name: retrivedContact.contacts.myProfile.name,
          receiveAddress: retrivedContact.contacts.myProfile.receiveAddress,
          uniqueName: retrivedContact.contacts.myProfile.uniqueName,
          uuid: retrivedContact.contacts.myProfile.uuid,
        };

        newContact['transactions'] = [
          {
            data: dm,
            from: sendingPubKey,
            uuid: uuid,
            paymentType: paymentType,
          },
        ];
        newContact['unlookedTransactions'] = 1;
        newContact['isAdded'] = false;

        toggleGlobalContactsInformation(
          {
            myProfile: {...globalContactsInformation.myProfile},
            addedContacts: encriptMessage(
              contactsPrivateKey,
              publicKey,
              JSON.stringify([...decodedAddedContacts, newContact]),
            ),
            // unaddedContacts: encriptMessage(
            //   contactsPrivateKey,
            //   publicKey,
            //   JSON.stringify(newAddedContacts),
            // ),
          },
          true,
        );
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

      toggleGlobalContactsInformation(
        {
          myProfile: {...globalContactsInformation.myProfile},
          addedContacts: encriptMessage(
            contactsPrivateKey,
            publicKey,
            JSON.stringify(newAddedContact),
          ),
          //   unaddedContacts:
          //     typeof globalContactsInformation.unaddedContacts === 'string'
          //       ? globalContactsInformation.unaddedContacts
          //       : [],
        },
        true,
      );
    }
  }, [inboundMessage, didGetToHomepage]);

  useEffect(() => {
    if (!didGetToHomepage) return;
    const channel = AblyRealtime.channels.get('blitzWalletPayments');

    channel.subscribe(globalContactsInformation.myProfile.uuid, e => {
      const {
        data: {sendingPubKey, data, uuid, paymentType},
        name,
      } = e;

      let dm = decryptMessage(contactsPrivateKey, sendingPubKey, data);

      dm = isJSON(dm);

      console.log(dm);

      if (!sendingPubKey) return;

      setInboundMessage({
        dm: dm,
        sendingPubKey: sendingPubKey,
        uuid: uuid,
        paymentType: paymentType,
      });
    });
  }, [didGetToHomepage]);
};

function isJSON(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
}
