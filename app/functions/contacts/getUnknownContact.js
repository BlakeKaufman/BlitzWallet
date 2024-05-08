import {queryContacts} from '../../../db';

export default async function getUnknownContact(sendingPubKey) {
  let users = await queryContacts('blitzWalletUsers');

  const {
    _document: {
      data: {
        value: {
          mapValue: {
            fields: {
              contacts: {
                mapValue: {
                  fields: {
                    myProfile: {
                      mapValue: {
                        fields: {uuid, uniqueName, bio, name, receiveAddress},
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  } = users.find(doc => {
    const uuid =
      doc['_document'].data.value.mapValue.fields.contacts.mapValue.fields
        .myProfile.mapValue.fields.uuid.stringValue;

    return uuid === sendingPubKey;
  });
  const user = uuid && {
    bio: bio.stringValue,
    isFavorite: false,
    name: name.stringValue,
    receiveAddress: receiveAddress.stringValue,
    uniqueName: uniqueName.stringValue,
    uuid: uuid.stringValue,
    transactions: [],
    unlookedTransactions: [],
  };

  return new Promise(resolve => {
    resolve(user || false);
  });
}
