import {useState} from 'react';
import {PermissionsAndroid} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {nanoid} from 'nanoid';
import firebaseSetup from '../db/firebase';

const {storage} = firebaseSetup();

export async function usePickImage() {
  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  ]);

  // if (
  //   granted['android.permission.CAMERA'] ===
  //     PermissionsAndroid.RESULTS.GRANTED &&
  //   granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
  //     PermissionsAndroid.RESULTS.GRANTED &&
  //   granted['android.permission.READ_EXTERNAL_STORAGE'] ===
  //     PermissionsAndroid.RESULTS.GRANTED
  // ) {
  const result = launchImageLibrary({
    mediaType: 'image',
  });
  return result;
  // }
}

export async function useCaptureImage() {
  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  ]);

  // if (
  //   granted['android.permission.CAMERA'] ===
  //     PermissionsAndroid.RESULTS.GRANTED &&
  //   granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
  //     PermissionsAndroid.RESULTS.GRANTED &&
  //   granted['android.permission.READ_EXTERNAL_STORAGE'] ===
  //     PermissionsAndroid.RESULTS.GRANTED
  // ) {
  const result = launchCamera({
    saveToPhotos: true,
    mediaType: 'image',
    cameraType: 'back',
  });
  return result;
  // }
}

export async function useUploadImage(uri, path, fName) {
  const fileName = fName || nanoid();
  const imageRef = storage().ref(`${path}/${fileName}.jpeg`);
  const metadata = {contentType: 'image/jpeg'};
  const snapshot = await imageRef.putFile(uri, metadata);

  const url = await imageRef.getDownloadURL();

  return {url, fileName};
}

const palette = {
  tealGreen: '#128c7e',
  tealGreenDark: '#274546',
  green: '#25d366',
  lime: '#dcf8c6',
  skyblue: '#34b7f1',
  smokeWhite: '#ABCFC2',
  white: 'white',
  gray: '#3C3C3C',
  lightGray: '#717171',
  stopRed: '#e00202',
  startGreen: '#07db07',
};

export const theme = {
  colors: {
    background: palette.smokeWhite,
    foreground: palette.tealGreenDark,
    primary: palette.tealGreenDark,
    tertiary: palette.lime,
    secondary: palette.green,
    white: palette.white,
    text: palette.gray,
    lightGray: palette.lightGray,
    stopRed: palette.stopRed,
    startGreen: palette.startGreen,
  },
};
