import {useRoute} from '@react-navigation/native';
import React, {useContext} from 'react';
import {View, Text} from 'react-native';
import GlobalContext from '../context/Context';
import Avatar from '../utilities/Avatar';

export default function ChatHeader() {
  const route = useRoute();
  const {
    theme: {colors},
  } = useContext(GlobalContext);
  return (
    <View style={{flexDirection: 'row'}}>
      <View>
        <Avatar size={40} user={route.params.user} />
      </View>
      <View
        style={{
          marginLeft: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{color: colors.white, fontSize: 18}}>
          {route.params.user.displayName || route.params.user.contactName}
        </Text>
      </View>
    </View>
  );
}
