import React, {useContext, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {View, NativeModules, NativeEventEmitter} from 'react-native';
import GlobalContext from '../context/Context';
import firebaseSetup from '../db/firebase';
import ContactsFloatingIcon from '../components/ContactsFloatingIcon';
import ListItem from '../components/ListItem';
import useContacts from '../hooks/useHooks';
import {AlanView} from '@alan-ai/alan-sdk-react-native';

export default function Chats() {
  const {auth, firestore} = firebaseSetup();
  const {currentUser} = auth();
  const {rooms, setRooms, setUnfilteredRooms} = useContext(GlobalContext);
  const contacts = useContacts();
  const navigation = useNavigation();
  const {
    theme: {colors},
  } = useContext(GlobalContext);
  const userRef = firestore().collection('users');
  const chatsQuery = firestore()
    .collection('rooms')
    .where(
      'participantsArray',
      'array-contains',
      currentUser.phoneNumber.replace(/\s+/g, ''),
    );

  const {AlanEventEmitter} = NativeModules;
  const alanEventEmitter = new NativeEventEmitter(AlanEventEmitter);

  function getContactName(name) {
    let contactData = contacts.find(data => data.displayName == name);
    return contactData;
  }

  useEffect(() => {
    alanEventEmitter.addListener('onCommand', data => {
      if (data.command == 'openContacts') {
        setTimeout(() => {
          navigation.navigate('contacts');
        }, 1000);
        // navigation.navigate('contacts');
      } else if (data.command == 'openChatRoom') {
        let contactDetails = getContactName(data.name);
        navigation.navigate('chat', {contactDetails});
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = chatsQuery.onSnapshot(
      querySnapshot => {
        const parsedChats = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          userB: doc
            .data()
            .participants.find(
              p =>
                p.phoneNumber.replace(/\s+/g, '') !==
                currentUser.phoneNumber.replace(/\s+/g, ''),
            ),
        }));
        setUnfilteredRooms(parsedChats);
        setRooms(parsedChats.filter(doc => doc.lastMessage));
      },
      error => console.log('>>>>>>>>>>>>', error),
    );
    return () => unsubscribe();
  }, []);

  function getUserB(user, contacts) {
    const userContact = contacts.find(c => c.phoneNumber === user.phoneNumber);
    if (userContact && userContact.displayName) {
      return {...user, displayName: userContact.displayName};
    }
    return user;
  }

  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1, padding: 5, paddingRight: 10}}>
        {rooms.map(room => (
          <ListItem
            type="chat"
            description={room.lastMessage.text}
            key={room.id}
            room={room}
            time={room.lastMessage.createdAt}
            user={getUserB(room.userB, contacts)}
          />
        ))}
        <ContactsFloatingIcon />
      </View>
      <View
        style={{
          width: '100%',
          height: 60,
          justifyContent: 'center',
          alignItems: 'center',
          bottom: 0,
        }}>
        <View
          style={{
            width: '100%',
            height: 60,
            display: 'flex',
            flexDirection: 'row',
            // backgroundColor: '#123456',
          }}>
          <AlanView
            // style={{zIndex: 100000}}
            projectid={
              'b82348f936953c75970b5f02c529537e2e956eca572e1d8b807a3e2338fdd0dc/stage'
            }
          />
        </View>
      </View>
    </View>
  );
}
