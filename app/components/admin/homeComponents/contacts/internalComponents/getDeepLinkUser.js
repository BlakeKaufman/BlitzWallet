import {getSignleContact} from '../../../../../../db';

export default async function getDeepLinkUser({
  decodedAddedContacts,
  deepLinkContent,
}) {
  try {
    const deepLinkUser = deepLinkContent.split('u/')[1];

    const rawUser = await getSignleContact(deepLinkUser);
    if (Object.keys(rawUser).length === 0 || !rawUser)
      return new Promise(resolve =>
        resolve({didWork: false, reason: 'User not found'}),
      );

    const user = rawUser[0].data();

    const newContact = {
      name: user.contacts.myProfile.name,
      uuid: user.contacts.myProfile.uuid,
      uniqueName: user.contacts.myProfile.uniqueName,
      receiveAddress: user.contacts.myProfile.receiveAddress,
      isFavorite: false,
      transactions: [],
      unlookedTransactions: 0,
      isAdded: true,
    };

    const isAlreadyAddedd =
      decodedAddedContacts.filter(userContact => {
        return (
          userContact.uniqueName.toLowerCase() ===
          newContact.uniqueName.toLowerCase()
        );
      }).length != 0;

    if (isAlreadyAddedd) {
      return new Promise(resolve =>
        resolve({didWork: false, reason: 'User is already a contact'}),
      );
    }

    return new Promise(resolve =>
      resolve(resolve({didWork: true, reason: '', data: newContact})),
    );
  } catch (err) {
    console.log(err);
    return new Promise(resolve =>
      resolve({didWork: false, reason: 'Error getting contact'}),
    );
  }
}
