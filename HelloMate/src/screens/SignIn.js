import React, {useContext, useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Image,
  TextInput,
  Text,
  ActivityIndicator,
} from 'react-native';
import GlobalContext from '../context/Context';
import firebaseSetup from '../db/firebase';
import {useNavigation} from '@react-navigation/native';
import PhoneInput from 'react-native-phone-number-input';
import {TouchableOpacity} from 'react-native-gesture-handler';

export default function SignIn() {
  const {auth} = firebaseSetup();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [value, setValue] = useState('');
  const [valid, setValid] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showOTPMessage, setShowOTPMessage] = useState(false);
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);

  // // If null, no SMS has been sent
  const [confirmation, setConfirmation] = useState('');
  const [code, setCode] = useState('');
  const phoneInput = useRef(null);

  const {
    theme: {colors},
  } = useContext(GlobalContext);

  async function requestOTP() {
    if (valid) {
      setIsLoading(true);
      setShowMessage(false);
      const confirm = await auth().signInWithPhoneNumber(
        phoneNumber.replace(/\s+/g, ''),
      );
      setConfirmation(confirm);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setShowMessage(true);
    }
  }

  async function signIn() {
    try {
      setIsLoading(true);
      await confirmation
        .confirm(code)
        .then(() => {
          setShowOTPMessage(false);
          navigation.navigate('profile');
          // navigation.navigate('home');
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
          setShowOTPMessage(true);
        });
    } catch (error) {
      console.log(error);
    }
  }

  if (isLoading) {
    return (
      <View
        style={{
          backgroundColor: '#274546',
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}>
        <ActivityIndicator
          size={100}
          accessibilityHint="Please wait..."
          color={colors.tertiary}
        />
      </View>
    );
  }

  if (!confirmation) {
    return (
      <View
        style={{
          backgroundColor: colors.foreground,
          height: '100%',
        }}>
        <View
          style={{
            backgroundColor: colors.foreground,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 50,
          }}>
          <Image
            source={require('../../assets/helloMate_logo.png')}
            style={{width: 200, height: 90, marginBottom: 20, top: '10%'}}
            resizeMode="cover"
          />
        </View>

        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            top: '15%',
          }}>
          {showMessage && !valid ? (
            <View style={{paddingBottom: 10}}>
              <Text style={{color: 'red', textAlign: 'center'}}>
                Please enter valid phone number
              </Text>
            </View>
          ) : (
            ''
          )}
          <PhoneInput
            containerStyle={{marginBottom: 20}}
            ref={phoneInput}
            defaultValue={phoneNumber}
            defaultCode="LK"
            layout="first"
            onChangeText={text => {
              setValue(text);
            }}
            onChangeFormattedText={text => {
              setPhoneNumber(text);
            }}
            withDarkTheme
            withShadow
            autoFocus
          />
          <View style={{marginTop: 20}}>
            <TouchableOpacity
              style={styles.button}
              title="Sign Up"
              disabled={!phoneNumber}
              onPress={() => {
                const checkValid = phoneInput.current?.isValidNumber(value);
                setValid(checkValid ? checkValid : false);
                requestOTP();
              }}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={{fontSize: 28, marginBottom: 20}}>Enter OTP</Text>
      {showOTPMessage ? (
        <View style={{paddingBottom: 10}}>
          <Text style={{color: 'red', textAlign: 'center'}}>
            Please enter valid OTP code
          </Text>
        </View>
      ) : (
        ''
      )}
      <TextInput
        placeholderTextColor={colors.background}
        style={styles.input}
        placeholder="Enter OTP code"
        value={code}
        onChangeText={setCode}
      />
      <TouchableOpacity
        style={styles.button}
        title="Confirm OTP"
        disabled={!code}
        onPress={() => signIn()}>
        <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: '#25d366',
    borderRadius: 15,
    alignContent: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#274546',
    fontSize: 22,
  },
  container: {
    backgroundColor: '#274546',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  input: {
    backgroundColor: '#F8F9F9',
    color: 'black',
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    padding: 12,
  },
});
