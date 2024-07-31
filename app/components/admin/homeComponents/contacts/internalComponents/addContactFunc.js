import {getPublicKey} from 'nostr-tools';
import {
  decryptMessage,
  encriptMessage,
} from '../../../../../functions/messaging/encodingAndDecodingMessages';

export default function addContact(
  newContact,
  masterInfoObject,
  toggleMasterInfoObject,
  navigate,
  navigation,
  contactsPrivateKey,
  isFromExpandedPage,
) {
  try {
    const publicKey = getPublicKey(contactsPrivateKey);
    let savedContacts =
      typeof masterInfoObject.contacts.addedContacts === 'string'
        ? [
            ...JSON.parse(
              decryptMessage(
                contactsPrivateKey,
                publicKey,
                masterInfoObject.contacts.addedContacts,
              ),
            ),
          ]
        : [];

    if (masterInfoObject.contacts.myProfile.uuid === newContact.uuid) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Cannot add yourself',
      });
      return;
    } else if (
      savedContacts.filter(
        savedContact =>
          savedContact.uuid === newContact.uuid ||
          newContact.uuid === masterInfoObject.contacts.myProfile.uuid,
      ).length > 0
    ) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Contact already added',
      });
      return;
    }

    savedContacts.push(newContact);

    toggleMasterInfoObject({
      contacts: {
        myProfile: {
          ...masterInfoObject.contacts.myProfile,
        },
        addedContacts: encriptMessage(
          contactsPrivateKey,
          publicKey,
          JSON.stringify(savedContacts),
        ),
        // unaddedContacts:
        //   typeof masterInfoObject.contacts.unaddedContacts === 'string'
        //     ? masterInfoObject.contacts.unaddedContacts
        //     : [],
      },
    });

    // if (isFromExpandedPage) {
    //   navigate.goBack();
    // }

    // setTimeout(() => {
    //   navigate.navigate('ErrorScreen', {
    //     errorMessage: 'Contact saved',
    //     navigationFunction: {
    //       navigator: navigation.jumpTo,
    //       destination: 'Contacts Page',
    //     },
    //   });
    // }, 800);
  } catch (err) {
    console.log(err);

    navigate.navigate('ErrorScreen', {errorMessage: 'Error adding contact'});
  }
}
