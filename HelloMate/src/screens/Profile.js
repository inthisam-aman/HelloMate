import React, {useContext, useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Button,
  StatusBar,
  StyleSheet,
} from 'react-native';
import GlobalContext from '../context/Context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  usePickImage,
  useCaptureImage,
  useUploadImage,
} from '../utilities/utils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firebaseSetup from '../db/firebase';
import {useNavigation} from '@react-navigation/native';
import BottomSheet from 'react-native-simple-bottom-sheet';

export default function Profile() {
  const panelRef = useRef(null);
  const {auth, firestore} = firebaseSetup();
  const [displayName, setDisplayName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [triggered, setTriggered] = useState(false);
  const navigation = useNavigation();

  const {
    theme: {colors},
  } = useContext(GlobalContext);

  async function handlePress() {
    const user = auth().currentUser;
    let photoURL;
    if (selectedImage) {
      const {url} = await useUploadImage(
        selectedImage,
        `images/${user.uid}`,
        'profilePicture',
      );
      photoURL = url;
    }
    const userData = {
      displayName: displayName,
      phoneNumber: user.phoneNumber.replace(/\s+/g, ''),
    };
    if (photoURL) {
      userData.photoURL = photoURL;
    }
    await Promise.all([
      auth().currentUser.updateProfile(userData),
      firestore()
        .collection('users')
        .doc(user.uid)
        .set({...userData, uid: user.uid}),
    ]);
    navigation.navigate('home');
  }

  async function handlePhotoPicker() {
    const result = await usePickImage();

    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.assets) {
      setSelectedImage(result.assets[0].uri);
    }
  }

  async function handlePhotoCapture() {
    const result = await useCaptureImage();

    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.assets) {
      setSelectedImage(result.assets[0].uri);
    }
  }

  return (
    <React.Fragment>
      <StatusBar style="auto" />
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          paddingTop: StatusBar.currentHeight + 20,
          padding: 20,
        }}>
        <Text style={{fontSize: 22, color: colors.foreground}}>
          Profile Info
        </Text>
        <Text style={{fontSize: 14, color: colors.text, marginTop: 20}}>
          Please provide your name and an optional profile photo
        </Text>
        <TouchableOpacity
          onPress={() => {
            panelRef.current.togglePanel();
            setTriggered(true);
          }}
          style={{
            marginTop: 30,
            borderRadius: 120,
            width: 120,
            height: 120,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {!selectedImage ? (
            <MaterialCommunityIcons
              name="camera-plus"
              color={colors.lightGray}
              size={45}
            />
          ) : (
            <Image
              source={{uri: selectedImage}}
              style={{width: '100%', height: '100%', borderRadius: 120}}
            />
          )}
        </TouchableOpacity>
        <TextInput
          placeholder="Type your name"
          value={displayName}
          onChangeText={setDisplayName}
          style={{
            color: 'black',
            borderBottomColor: colors.primary,
            marginTop: 40,
            borderBottomWidth: 2,
            width: '100%',
          }}
        />
        <View style={{marginTop: 'auto', width: 80}}>
          <Button
            title="Next"
            color={colors.secondary}
            onPress={handlePress}
            disabled={!displayName}
          />
        </View>
      </View>
      <BottomSheet
        ref={ref => (panelRef.current = ref)}
        sliderMinHeight={0}
        isClosed>
        <View style={{display: 'flex', flexDirection: 'row', marginBottom: 20}}>
          <TouchableOpacity
            onPress={handlePhotoCapture}
            style={styles.selectionContainer}>
            <Ionicons name="camera" size={30} color={colors.foreground} />
            <Text style={styles.bottomSheetText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePhotoPicker}
            style={styles.selectionContainer}>
            <Ionicons name="images" size={30} color={colors.stopRed} />
            <Text style={styles.bottomSheetText}>Library</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  bottomSheetText: {paddingVertical: 5, color: 'black', fontWeight: '900'},
  selectionContainer: {alignItems: 'center', width: '50%'},
});
