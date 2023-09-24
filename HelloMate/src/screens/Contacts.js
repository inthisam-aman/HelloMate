import {useRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ListItem from '../components/ListItem';
import GlobalContext from '../context/Context';
import firebaseSetup from '../db/firebase';
import useContacts from '../hooks/useHooks';
import {AlanView} from '@alan-ai/alan-sdk-react-native';

export default function Contacts() {
  const route = useRoute();
  const image = route.params && route.params.image;
  const contacts = useContacts();
  const navigation = useNavigation();
  const {AlanEventEmitter} = NativeModules;
  const alanEventEmitter = new NativeEventEmitter(AlanEventEmitter);

  function getContactName(name) {
    let contactData = contacts.find(data => data.displayName == name);
    console.log(JSON.stringify(contactData));
    return contactData;
  }

  useEffect(() => {
    alanEventEmitter.addListener('onCommand', data => {
      if (data.command == 'openContacts') {
        navigation.navigate('contacts');
      } else if (data.command == 'openChatRoom') {
        let contactDetails = getContactName(data.name);
        console.log('########### Chat room name :- ', data.name);
        console.log('----------- Open chat room :- ', contactDetails);
        navigation.navigate('chat', {contactDetails});
      }
    });
  });

  function callProjectApi(name) {
    /// Provide any params with json
    AlanManager.callProjectApi(
      'script::getContactList',
      {data: getContactName(name)},
      (error, result) => {
        if (error) {
          console.error(error);
        } else {
          console.log('>>>>>>>>> Alan output :- ', result);
        }
      },
    );
  }
  // return (
  //   <View>
  return (
    <FlatList
      style={{flex: 1, padding: 10, height: '90%'}}
      data={contacts}
      keyExtractor={(_, i) => i}
      renderItem={({item}) => <ContactPreview contact={item} image={image} />}
    />
  );

  {
    /* <AlanView
        projectid={
          'b82348f936953c75970b5f02c529537e2e956eca572e1d8b807a3e2338fdd0dc/stage'
        }
      />
    </View>
  ); */
  }
}

function ContactPreview({contact, image}) {
  const {firestore} = firebaseSetup();
  const firestoreSetup = firestore().collection('users');
  const {unfilteredRooms} = useContext(GlobalContext);
  const [user, setUser] = useState(contact);

  useEffect(() => {
    const unsubscribe = firestoreSetup
      .where('phoneNumber', '==', contact.phoneNumber)
      .get()
      .then(snapshot => {
        snapshot.docs.map(snap => {
          if (snap.phoneNumber === contact.phoneNumber) {
            setUser(prevUser => ({...prevUser, snap}));
          } else {
            return;
          }
        });
        // const userDoc = snapshot.docs[0].data();
        // snapshot.forEach(doc => setUser(prevUser => ({...prevUser, doc})));
        // setUser(prevUser => ({...prevUser, userDoc}));
      })
      .catch(error => {
        console.log('>>>>>>>. ', error);
      });
    return () => unsubscribe;
  }, []);
  return (
    <ListItem
      type="contacts"
      user={user}
      image={image}
      room={unfilteredRooms.find(room =>
        room.participantsArray.includes(contact.phoneNumber),
      )}
    />
  );
}
