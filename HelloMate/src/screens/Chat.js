// @refresh reset
import {useRoute} from '@react-navigation/native';
import 'react-native-get-random-values';
import {nanoid} from 'nanoid';
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import {
  View,
  ImageBackground,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firebaseSetup from '../db/firebase';
import GlobalContext from '../context/Context';
import {
  Actions,
  Bubble,
  GiftedChat,
  InputToolbar,
} from 'react-native-gifted-chat';
import {
  usePickImage,
  useUploadImage,
  useCaptureImage,
} from '../utilities/utils';
import ImageView from 'react-native-image-viewing';
import Voice from '@react-native-voice/voice';
import BottomSheet from 'react-native-simple-bottom-sheet';

const randomId = nanoid();

export default function Chat() {
  const panelRef = useRef(null);
  const {auth, firestore} = firebaseSetup();
  const roomCollection = firestore().collection('rooms');
  const userRef = firestore().collection('users');
  const [roomHash, setRoomHash] = useState('');
  const [messages, setMessages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState('');
  const {
    theme: {colors},
  } = useContext(GlobalContext);
  const {currentUser} = auth();
  const route = useRoute();
  const room = route.params.room;
  const [selectedImage, setSeletedImage] = useState(route.params.image);
  // const selectedImage = route.params.image;
  const userB = route.params.user;

  ///--------------------------------------
  const [isStarted, setIsStarted] = useState(false);
  const [results, setResults] = useState('');
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    //Setting callbacks for the process status
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      //destroy the process after switching the screen
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = e => {
    console.log('onSpeechStart: ', e);
  };

  const onSpeechEnd = e => {
    console.log('onSpeechEnd: ', e);
  };

  const onSpeechError = e => {
    console.log('onSpeechError: ', e);
    setError(JSON.stringify(e.error));
  };

  const onSpeechResults = e => {
    let text = e.value[0];
    setResults(text);
    // setResults(...results,text);
    console.log('onSpeechResults: ', e);
  };

  async function startRecognizing() {
    try {
      setIsStarted(true);
      await Voice.start('en-US');
    } catch (e) {
      console.log(' Starting error >>>>>>>> : ', e);
    }
  }

  async function stopRecognizing() {
    try {
      setIsStarted(false);
      Voice.stop();
    } catch (e) {
      console.log(' Stopping error >>>>>>>> : ', e);
    }
  }

  async function cancelRecognizing() {
    try {
      await Voice.cancel();
    } catch (e) {
      console.error(e);
    }
  }

  ///--------------------------------------

  const senderUser = currentUser.photoURL
    ? {
        name: currentUser.displayName,
        _id: currentUser.uid,
        avatar: currentUser.photoURL,
      }
    : {name: currentUser.displayName, _id: currentUser.uid};

  const roomId = room ? room.id : randomId;

  const roomRef = roomCollection.doc(roomId);
  const roomMessagesRef = roomCollection.doc(roomId).collection('messages');

  function getUserProfile(phoneNumber) {
    userRef
      .where('phoneNumber', '==', contact.phoneNumber.replace(/\s+/g, ''))
      .get();
  }

  useEffect(() => {
    (async () => {
      if (!room) {
        const currUserData = {
          displayName: currentUser.displayName,
          phoneNumber: currentUser.phoneNumber.replace(/\s+/g, ''),
        };
        if (currentUser.photoURL) {
          currUserData.photoURL = currentUser.photoURL;
        }
        const userBData = {
          displayName: userB.contactName || userB.displayName || '',
          phoneNumber: userB.phoneNumber.replace(/\s+/g, ''),
        };
        if (userB.photoURL) {
          userBData.photoURL = userB.photoURL;
        }
        const roomData = {
          participants: [currUserData, userBData],
          participantsArray: [
            currentUser.phoneNumber.replace(/\s+/g, ''),
            userB.phoneNumber.replace(/\s+/g, ''),
          ],
        };
        try {
          await roomRef.set(roomData);
        } catch (error) {
          console.log(error);
        }
      }
      const phoneNumberHash = `${currentUser.phoneNumber.replace(
        /\s+/g,
        '',
      )}:${userB.phoneNumber.replace(/\s+/g, '')}`;
      setRoomHash(phoneNumberHash);
      // if (selectedImageView) {
      //   await sendImage(selectedImageView, phoneNumberHash);
      // }
      if (selectedImage) {
        await sendImage(selectedImage, phoneNumberHash);
      }
    })();
  }, []);

  useEffect(() => {
    if (!triggered) {
      panelRef.current.close;
    }
    const unsubscribe = roomMessagesRef.onSnapshot(querySnapshot => {
      const messagesFirestore = querySnapshot
        .docChanges()
        .filter(({type}) => type === 'added')
        .map(({doc}) => {
          const message = doc.data();
          return {...message, createdAt: message.createdAt.toDate()};
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      appendMessages(messagesFirestore);
    });
    return () => unsubscribe();
  }, []);

  const appendMessages = useCallback(
    messages => {
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, messages),
      );
    },
    [messages],
  );

  async function onSend(messages = []) {
    const writes = messages.map(m => roomMessagesRef.add(m));
    const lastMessage = messages[messages.length - 1];

    writes.push(roomRef.update({lastMessage}));
    await Promise.all(writes);
  }

  async function sendImage(uri, roomPath) {
    const {url, fileName} = await useUploadImage(
      uri,
      `images/rooms/${roomPath || roomHash}`,
    );
    const message = {
      _id: fileName,
      text: '',
      createdAt: new Date(),
      user: senderUser,
      image: url,
    };
    const lastMessage = {...message, text: 'Image'};
    await Promise.all([
      roomMessagesRef.add(message),
      roomRef.update(lastMessage),
    ]);
  }

  async function handlePhotoPicker() {
    const result = await usePickImage();

    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.assets) {
      sendImage(result.assets[0].uri);
    }
  }

  async function handlePhotoCapture() {
    const result = await useCaptureImage();

    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.assets) {
      sendImage(result.assets[0].uri);
    }
  }

  function scrollToBottomComponent() {
    return (
      <Ionicons
        name="caret-down-circle-outline"
        size={40}
        color="#000"
        style={{alignSelf: 'center'}}
      />
    );
  }

  return (
    <ImageBackground
      resizeMode="cover"
      source={require('../../assets/chatbg.png')}
      style={{flex: 1}}>
      <GiftedChat
        messagesContainerStyle={{paddingBottom: 15}}
        quickReplyTextStyle={{color: 'black'}}
        // textInputProps={{style: {color: 'black'}}}
        textInputProps={{style: {color: 'black'}}}
        scrollToBottom
        scrollToBottomComponent={scrollToBottomComponent}
        scrollToBottomStyle={{
          width: 50,
          height: 50,
          borderRadius: 50,
        }}
        onSend={onSend}
        messages={messages}
        user={senderUser}
        renderAvatar={null}
        text={results}
        onInputTextChanged={text => setResults(text)}
        renderActions={props => (
          <Actions
            {...props}
            containerStyle={{
              position: 'absolute',
              right: 50,
              bottom: 5,
              // zIndex: 999,
            }}
            // onPressActionButton={() => panelRef.current.togglePanel()}
            icon={() => (
              <Ionicons
                name="camera"
                size={30}
                color={colors.lightGray}
                onPress={() => {
                  panelRef.current.togglePanel();
                  setTriggered(true);
                }}
              />
            )}
          />
        )}
        timeTextStyle={{right: {color: 'black'}}}
        renderSend={props => {
          const {text, messageIdGenerator, user, onSend} = props;
          return (
            <TouchableOpacity
              style={{
                height: 45,
                width: 45,
                borderRadius: 45,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 5,
                // marginRight: 5,
                right: -200,
              }}
              onPress={() => {
                if (text && onSend) {
                  onSend(
                    {
                      text: results,
                      user,
                      _id: messageIdGenerator(),
                    },
                    true,
                  );
                }
              }}>
              <Ionicons name="send" size={25} color={colors.white} />
            </TouchableOpacity>
          );
        }}
        renderInputToolbar={props => (
          <InputToolbar
            {...props}
            containerStyle={{
              marginLeft: 8,
              marginRight: 8,
              borderRadius: 10,
              marginBottom: 8,
              paddingTop: 5,
              paddingLeft: 10,
              paddingRight: 10,
            }}
          />
        )}
        renderBubble={props => (
          <Bubble
            {...props}
            textStyle={{right: {color: colors.text}}}
            wrapperStyle={{
              left: {
                backgroundColor: colors.white,
              },
              right: {
                backgroundColor: colors.tertiary,
              },
            }}
          />
        )}
        renderMessageImage={props => {
          return (
            <View style={{borderRadius: 10, padding: 2}}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(true);
                  setSeletedImage(props.currentMessage.image);
                }}>
                <Image
                  resizeMode="contain"
                  style={{
                    width: 200,
                    height: 200,
                    padding: 6,
                    borderRadius: 15,
                    resizeMode: 'cover',
                  }}
                  source={{uri: props.currentMessage.image}}
                />
                {selectedImage ? (
                  <ImageView
                    imageIndex={0}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                    images={[{uri: selectedImage}]}
                  />
                ) : null}
              </TouchableOpacity>
            </View>
          );
        }}
      />
      <View
        style={{
          width: '100%',
          // display: 'flex',
          // flexDirection: 'row',
        }}>
        {isStarted ? (
          <TouchableOpacity
            onPress={stopRecognizing}
            style={{
              // width: '50%',
              height: 60,
              backgroundColor: colors.stopRed,
              alignItems: 'center',
            }}>
            <Ionicons
              name="stop"
              size={40}
              color={colors.white}
              style={{lineHeight: 60}}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={startRecognizing}
            style={{
              // width: '50%',
              backgroundColor: colors.startGreen,
              alignItems: 'center',
              height: 60,
            }}>
            <Ionicons
              name="mic"
              size={45}
              color={colors.foreground}
              style={{lineHeight: 60}}
            />
          </TouchableOpacity>
        )}
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bottomSheetText: {paddingVertical: 5, color: 'black', fontWeight: '900'},
  selectionContainer: {alignItems: 'center', width: '50%'},
});
