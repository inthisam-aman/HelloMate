import React, {useContext} from 'react';
import {TouchableOpacity} from 'react-native';
import '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import GlobalContext from '../context/Context';
import {useNavigation} from '@react-navigation/native';
export default function ContactsFloatingIcon() {
  const {
    theme: {colors},
  } = useContext(GlobalContext);
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('contacts')}
      style={{
        position: 'absolute',
        right: 20,
        bottom: 20,
        borderRadius: 60,
        width: 60,
        height: 60,
        backgroundColor: colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <MaterialCommunityIcons
        name="android-messages"
        size={30}
        color="white"
        style={{transform: [{scaleX: -1}]}}
      />
    </TouchableOpacity>
  );
}
