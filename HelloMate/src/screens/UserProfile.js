import React, {useEffect, useState} from 'react';
import {View, Image, Text, TouchableOpacity, StyleSheet} from 'react-native';
import firebaseSetup from '../db/firebase';
import {useNavigation} from '@react-navigation/native';

export default function UserProfile() {
  const {firestore, auth} = firebaseSetup();
  const {currentUser} = auth();
  const [username, setUsername] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const navigation = useNavigation();
  const userRef = firestore().collection('users').doc(currentUser.uid).get();

  useEffect(() => {
    userRef.then(querySnapshot => {
      setUsername(querySnapshot.data.displayName);
      setProfilePhoto(querySnapshot.data.displayName);
    });
  }, []);
  return (
    <View style={{height: '100%', backgroundColor: '#274546', opacity: 0.82}}>
      <View
        style={{
          alignItems: 'center',
          paddingTop: 60,
        }}>
        <Image
          style={{
            width: 200,
            height: 200,
            borderRadius: 100,
            borderWidth: 8,
            borderColor: '#ABCFC2',
            alignSelf: 'center',
          }}
          source={
            currentUser.photoURL
              ? {uri: currentUser.photoURL}
              : require('../../assets/icon-square.png')
          }
          resizeMode="cover"
        />
      </View>
      <View style={{marginLeft: 25, marginTop: 30}}>
        <Text style={styles.dataHeaderText}>Name:</Text>
        <Text style={styles.dataText}>{currentUser.displayName}</Text>
        <Text style={styles.dataHeaderText}>Phone:</Text>
        <Text style={styles.dataText}>{currentUser.phoneNumber}</Text>
      </View>
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignSelf: 'center',
          alignItems: 'center',
          height: 50,
          width: '60%',
          borderRadius: 15,
          marginTop: 70,
          marginBottom: 5,
          backgroundColor: '#e34321',
        }}
        onPress={() => {
          auth().signOut();
          navigation.navigate('signIn');
        }}>
        <Text style={{fontWeight: '800', fontSize: 18, color: '#fff'}}>
          Sign out
        </Text>
      </TouchableOpacity>
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          bottom: 15,
          position: 'absolute',
        }}>
        <Text style={{fontSize: 13}}>from</Text>
        <Text style={{fontSize: 15, color: '#fff'}}>Blitz Code</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dataText: {
    width: '90%',
    fontWeight: '800',
    fontSize: 20,
    color: 'black',
    marginTop: 5,
    color: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#ABCFC2',
    paddingBottom: 10,
  },
  dataHeaderText: {
    fontWeight: '500',
    fontSize: 15,
    color: 'black',
    marginTop: 20,
    color: '#ABCFC2',
  },
});
