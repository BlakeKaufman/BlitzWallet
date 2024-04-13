import {useEffect} from 'react';
import {connectToAlby} from '../functions/messaging/getToken';
import {decryptMessage} from '../functions/messaging/encodingAndDecodingMessages';
import {useGlobalContextProvider} from '../../context-store/context';

export const listenForMessages = () => {
  const {masterInfoObject, toggleMasterInfoObject, contactsPrivateKey} =
    useGlobalContextProvider();
  useEffect(() => {
    const realtime = connectToAlby();

    const channel = realtime.channels.get('blitzWalletPayments');

    channel.subscribe(masterInfoObject.contacts.myProfile.uuid, e => {
      const {
        data: {sendingPubKey, data, uuid, paymentType},
        name,
      } = e;

      console.log(uuid);
      let dm = decryptMessage(contactsPrivateKey, sendingPubKey, data);

      dm = isJSON(dm) || dm;

      const newAddedContact = [...masterInfoObject.contacts.addedContacts].map(
        contact => {
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
        },
      );

      toggleMasterInfoObject({
        contacts: {
          myProfile: {...masterInfoObject.contacts.myProfile},
          addedContacts: newAddedContact,
        },
      });
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
