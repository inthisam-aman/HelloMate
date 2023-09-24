import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useContext} from 'react';
import {View, LogBox, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {usePickImage, useCaptureImage} from '../utilities/utils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GlobalContext from '../context/Context';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
export default function Photo() {
  const {
    theme: {colors},
  } = useContext(GlobalContext);
  const navigation = useNavigation();

  async function handlePhotoPicker() {
    const result = await usePickImage();

    if (result.didCancel) {
      console.log('User cancelled image picker');
      setTimeout(() => navigation.navigate('chats'), 90);
    } else if (result.assets) {
      navigation.navigate('contacts', {image: result.assets[0].uri});
    }
  }

  async function handlePhotoCapture() {
    const result = await useCaptureImage();

    if (result.didCancel) {
      console.log('User cancelled camera');
      setTimeout(() => navigation.navigate('chats'), 90);
    } else if (result.assets) {
      navigation.navigate('contacts', {image: result.assets[0].uri});
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const result = await usePickImage();
      if (result.didCancel) {
        console.log('User cancelled image picker');
        setTimeout(() => navigation.navigate('chats'), 90);
      } else if (result.assets) {
        navigation.navigate('contacts', {image: result.assets[0].uri});
      }
    });

    return () => unsubscribe();
  }, [navigation]);
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 20,
        marginVertical: 100,
      }}>
      {/* <TouchableOpacity
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
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomSheetText: {paddingVertical: 5, color: 'black', fontWeight: '900'},
  selectionContainer: {alignItems: 'center', width: '50%'},
});
