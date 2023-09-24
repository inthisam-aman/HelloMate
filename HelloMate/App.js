import React, {useState, useEffect, useContext} from 'react';
import {
  SafeAreaView,
  Text,
  ImageBackground,
  LogBox,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import {useNavigation, NavigationContainer} from '@react-navigation/native';
import SignIn from './src/screens/SignIn';
import Chats from './src/screens/Chats';
import Chat from './src/screens/Chat';
import Photo from './src/screens/Photo';
import Profile from './src/screens/Profile';
import Contacts from './src/screens/Contacts';
import UserProfile from './src/screens/UserProfile';
import GlobalContext from './src/context/Context';
import ContextWrapper from './src/context/ContextWrapper';
import ChatHeader from './src/components/ChatHeader';
import useContacts from './src/hooks/useHooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createStackNavigator} from '@react-navigation/stack';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import firebaseSetup from './src/db/firebase';
import {AlanView} from '@alan-ai/alan-sdk-react-native';

LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted from react-native core and will be removed in a future release.',
]);
LogBox.ignoreAllLogs();

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

const App = () => {
  const {auth} = firebaseSetup();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    theme: {colors},
  } = useContext(GlobalContext);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setLoading(false);
      if (user) {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      {!currentUser ? (
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="signIn" component={SignIn} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.foreground,
              shadowOpacity: 0,
              elevation: 0,
            },
            headerTintColor: colors.white,
          }}>
          {!currentUser.displayName && (
            <Stack.Screen
              name="profile"
              component={Profile}
              options={{headerShown: false}}
            />
          )}
          <Stack.Screen
            name="home"
            options={{title: 'HelloMate'}}
            component={Home}
          />
          <Stack.Screen
            name="contacts"
            options={{title: 'Select Contact'}}
            component={Contacts}
          />
          <Stack.Screen
            name="chat"
            component={Chat}
            options={{headerTitle: props => <ChatHeader {...props} />}}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

function voiceCommandHandler() {
  const contacts = useContacts();
  const navigation = useNavigation();
  const {AlanEventEmitter} = NativeModules;
  const alanEventEmitter = new NativeEventEmitter(AlanEventEmitter);

  function getContactName(name) {
    let contactData = contacts.find(data => data.displayName == name);
    console.log(JSON.stringify(contactData));
    return contactData;
  }

  useEffect(() => {
    alanEventEmitter.addListener('onCommand', data => {
      if (data.command == 'openContacts') {
        navigation.navigate('contacts');
      } else if (data.command == 'openChatRoom') {
        let contactDetails = getContactName(data.name);
        navigation.navigate('chat', {contactDetails});
      }
    });
  });
  return (
    <NavigationContainer>
      <AlanView
        projectid={
          'b82348f936953c75970b5f02c529537e2e956eca572e1d8b807a3e2338fdd0dc/stage'
        }
      />
    </NavigationContainer>
  );
}

function Home() {
  const {
    theme: {colors},
  } = useContext(GlobalContext);
  return (
    <Tab.Navigator
      screenOptions={({route}) => {
        return {
          tabBarLabel: () => {
            if (route.name === 'photo') {
              return <Ionicons name="camera" size={24} color={colors.white} />;
            } else {
              return (
                <Text
                  style={{
                    color: colors.white,
                    fontWeight: '500',
                    fontSize: 16,
                  }}>
                  {route.name.toLocaleUpperCase()}
                </Text>
              );
            }
          },
          tabBarBounces: true,
          tabBarShowIcon: true,
          tabBarLabelStyle: {
            color: colors.white,
          },
          tabBarIndicatorStyle: {
            backgroundColor: colors.white,
          },
          tabBarStyle: {
            backgroundColor: colors.foreground,
          },
        };
      }}
      initialRouteName="chats">
      <Tab.Screen name="photo" component={Photo} />
      <Tab.Screen name="chats" component={Chats} />
      <Tab.Screen name="Profile" component={UserProfile} />
    </Tab.Navigator>
  );
}

const Main = () => {
  return (
    <SafeAreaView>
      <ImageBackground
        source={require('./assets/splash_screen_01.jpeg')}
        style={{width: '100%', height: '100%'}}>
        <ContextWrapper>
          <App />
        </ContextWrapper>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Main;
