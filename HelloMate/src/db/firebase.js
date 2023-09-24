import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

const firebaseConfig = {
  apiKey: '<Firebase apiKey>',
  authDomain: 'hellomate-v1.firebaseapp.com',
  projectId: 'hellomate-v1',
  storageBucket: 'hellomate-v1.appspot.com',
  messagingSenderId: '<Enter data>',
  appId: '<Enter appId provided by firebase>',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default () => {
  return {firebase, auth, storage, firestore};
};
