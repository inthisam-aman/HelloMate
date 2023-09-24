import {useEffect, useState} from 'react';
import {PermissionsAndroid} from 'react-native';

import Contacts from 'react-native-contacts';

export default function useContacts() {
  const [contacts, setContacts] = useState([]);
  useEffect(() => {
    (async () => {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts',
          message: 'This app would like to view your contacts.',
          buttonPositive: 'Please accept bare mortal',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Contacts.getAll()
          .then(contacts => {
            setContacts(contacts.map(mapContactToUser));
          })
          .catch(e => {
            console.log(e);
          });
      }
    })();
  }, []);

  // return contacts.sort((a, b) => a.displayName.localeCompare(b.displayName));
  // return contacts.sort((a, b) => (a.displayName > b.displayName ? 1 : -1));
  return contacts;
}
function mapContactToUser(contact) {
  return {
    displayName: contact.displayName,
    phoneNumber: contact.phoneNumbers[0]?.number.replace(/\s+/g, ''),
  };
}
