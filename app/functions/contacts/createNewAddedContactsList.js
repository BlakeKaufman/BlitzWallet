export function createNewAddedContactsList(
  masterInfoObject,
  selectedContact,
  updatedTransactions,
) {
  const newAddedContact = [...masterInfoObject.contacts.addedContacts].map(
    contact => {
      if (contact.uuid === selectedContact.uuid) {
        return {
          ...contact,
          transactions: updatedTransactions,
        };
      } else return contact;
    },
  );

  return newAddedContact;
}
