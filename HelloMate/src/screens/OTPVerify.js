import React, {useContext, useState} from 'react';
import {View, TextInput, Button} from 'react-native';
import Context from '../context/Context';

export default function SignIn(props) {
  const confirmation = props.confirmation;
  const [code, setCode] = useState('');

  const {
    theme: {colors},
  } = useContext(Context);

  async function signIn() {
    try {
      await confirmation.confirm(code);
      console.log('Signed In');
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <View style={{marginTop: 20}}>
      <TextInput
        placeholder="Enter OTP code"
        value={code}
        onChangeText={setCode}
        style={{
          borderBottomColor: colors.primary,
          borderBottomWidth: 2,
          width: 200,
        }}
      />
      <Button title="Confirm OTP" disabled={!code} onPress={() => signIn()} />
    </View>
  );
}
