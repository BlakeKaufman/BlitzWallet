export function createNewAddedContactsList(
  decodedAddedContacts,
  selectedContact,
  updatedTransactions,
) {
  const newAddedContact = decodedAddedContacts.map(contact => {
    if (contact.uuid === selectedContact.uuid) {
      return {
        ...contact,
        transactions: updatedTransactions,
      };
    } else return contact;
  });

  return newAddedContact;
}
