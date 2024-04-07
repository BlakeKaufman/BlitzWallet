import {TabActions, TabRouter, useNavigation} from '@react-navigation/native';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SATSPERBITCOIN,
  SIZES,
} from '../../../../../constants';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {useEffect, useRef, useState} from 'react';
import {randomUUID} from 'expo-crypto';

import axios from 'axios';
import {btoa, atob, toByteArray} from 'react-native-quick-base64';

import {useDrawerStatus} from '@react-navigation/drawer';
import {copyToClipboard} from '../../../../../functions';

import ContextMenu from 'react-native-context-menu-view';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const INPUTTOKENCOST = 30 / 1000000;
const OUTPUTTOKENCOST = 60 / 1000000;

export default function ChatGPTHome(props) {
  const navigate = useNavigation();
  const {
    theme,
    nodeInformation,
    userBalanceDenomination,
    masterInfoObject,
    toggleMasterInfoObject,
  } = useGlobalContextProvider();
  const insets = useSafeAreaInsets();
  const chatRef = useRef(null);
  const flatListRef = useRef(null);
  const textTheme = theme ? COLORS.darkModeText : COLORS.lightModeText;
  const [chatHistory, setChatHistory] = useState({
    conversation: [],
    uuid: '',
    lastUsed: '',
    firstQuery: '',
  });
  const [newChats, setNewChats] = useState([]);
  const [wantsToLeave, setWantsToLeave] = useState(null);
  const isDrawerFocused = useDrawerStatus() === 'open';
  const [userChatText, setUserChatText] = useState('');
  const totalAvailableCredits = masterInfoObject.chatGPT.credits;
  const [showScrollBottomIndicator, setShowScrollBottomIndicator] =
    useState(false);

  const conjoinedLists = [...chatHistory.conversation, ...newChats];

  useEffect(() => {
    !isDrawerFocused && chatRef.current.focus();
  }, [isDrawerFocused]);

  useEffect(() => {
    if (totalAvailableCredits < 30) {
      navigate.navigate('AddChatGPTCredits', {navigation: props.navigation});
      return;
    }

    if (!props.route.params?.chatHistory) return;
    const loadedChatHistory = props.route.params.chatHistory;

    setChatHistory(loadedChatHistory);
  }, []);

  useEffect(() => {
    if (wantsToLeave === null) return;
    if (!wantsToLeave) {
      props.navigation.navigate('App Store');
      return;
    }

    (async () => {
      let savedHistory = masterInfoObject.chatGPT.conversation;

      const filteredHistory =
        savedHistory &&
        savedHistory.filter(item => {
          return item.uuid === chatHistory.uuid;
        }).length != 0;

      let newChatHistoryObject = {};

      if (filteredHistory) {
        newChatHistoryObject = {...chatHistory};
        newChatHistoryObject['conversation'] = [
          ...chatHistory.conversation,
          ...newChats,
        ];
        newChatHistoryObject['lastUsed'] = new Date();
      } else {
        newChatHistoryObject['conversation'] = [
          ...chatHistory.conversation,
          ...newChats,
        ];
        newChatHistoryObject['firstQuery'] = newChats[0].content;
        newChatHistoryObject['lasdUsed'] = new Date();
        newChatHistoryObject['uuid'] = randomUUID();
        savedHistory.push(newChatHistoryObject);
      }

      const newHisotry = filteredHistory
        ? savedHistory.map(item => {
            if (item.uuid === newChatHistoryObject.uuid)
              return newChatHistoryObject;
            else return item;
          })
        : savedHistory;

      toggleMasterInfoObject({
        chatGPT: {
          conversation: newHisotry,
          credits: masterInfoObject.chatGPT.credits,
        },
      });

      props.navigation.navigate('App Store');
    })();

    // Save chat history here
  }, [wantsToLeave]);

  const flatListItem = ({item}) => {
    return (
      <ContextMenu
        onPress={e => {
          const targetEvent = e.nativeEvent.name.toLowerCase();
          if (targetEvent === 'copy') {
            copyToClipboard(item.content, navigate);
          } else {
            setUserChatText(item.content);
            chatRef.current.focus();
          }
        }}
        previewBackgroundColor={
          theme
            ? COLORS.darkModeBackgroundOffset
            : COLORS.lightModeBackgroundOffset
        }
        actions={[{title: 'Copy'}, {title: 'Edit'}]}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',

            alignItems: 'baseline',
            // marginBottom: 10,
            padding: 10,
          }}
          // key={item.uuid}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 5,
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
            }}>
            <Image
              style={{
                height: item.role === 'user' ? 10 : 15,
                width: item.role === 'user' ? 10 : 15,
              }}
              source={
                item.role === 'user'
                  ? ICONS.logoIcon
                  : theme
                  ? ICONS.chatgptLight
                  : ICONS.chatgptDark
              }
            />
          </View>
          <View style={{height: 'auto', width: '95%'}}>
            <Text
              style={{
                fontFamily: FONT.Title_Regular,
                fontSize: SIZES.medium,
                fontWeight: '500',
                color: textTheme,
              }}>
              {item.role === 'user' ? 'You' : 'ChatGPT'}
            </Text>
            <Text
              style={{
                width: '90%',
                // flexWrap: 'wrap',
                fontFamily: FONT.Title_Regular,
                fontSize: SIZES.medium,
                color:
                  item.content.toLowerCase() === 'error with request'
                    ? COLORS.cancelRed
                    : textTheme,
              }}>
              {item.content || (
                <ActivityIndicator color={textTheme} size={'small'} />
              )}
            </Text>
          </View>
        </View>
      </ContextMenu>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{
        flex: 1,
        backgroundColor: theme
          ? COLORS.darkModeBackground
          : COLORS.lightModeBackground,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={closeChat}>
          <Image
            style={[styles.topBarIcon, {transform: [{translateX: -6}]}]}
            source={ICONS.smallArrowLeft}
          />
        </TouchableOpacity>

        <Text style={[styles.topBarText, {color: textTheme}]}>ChatGPT 4</Text>

        <TouchableOpacity
          onPress={() => {
            Keyboard.dismiss();
            props.navigation.openDrawer();
          }}>
          <Image style={{height: 20, width: 20}} source={ICONS.drawerList} />
        </TouchableOpacity>
      </View>
      <View>
        <Text
          style={{
            fontFamily: FONT.Title_Regular,
            fontSize: SIZES.medium,
            textAlign: 'center',
            color: textTheme,
          }}>
          Available credits: {totalAvailableCredits.toFixed(2)}{' '}
          {userBalanceDenomination === 'sats'
            ? 'sats'
            : nodeInformation.fiatStats.coin}{' '}
        </Text>
      </View>

      <View style={[styles.container]}>
        {conjoinedLists.length === 0 ? (
          <View
            style={[
              styles.container,
              {alignItems: 'center', justifyContent: 'center'},
            ]}>
            <View
              style={[
                styles.noChatHistoryImgContainer,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeBackgroundOffset,
                },
              ]}>
              <Image style={{width: 20, height: 20}} source={ICONS.logoIcon} />
            </View>
          </View>
        ) : (
          <View style={{flex: 1, marginTop: 20, position: 'relative'}}>
            <FlatList
              ref={flatListRef}
              inverted
              onScroll={e => {
                const offset = e.nativeEvent.contentOffset.y;

                if (offset > 1) setShowScrollBottomIndicator(true);
                else setShowScrollBottomIndicator(false);
              }}
              scrollEnabled={true}
              data={conjoinedLists}
              renderItem={flatListItem}
              key={item => item.uuid}
              contentContainerStyle={{flexDirection: 'column-reverse'}}
            />
            {showScrollBottomIndicator && (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  flatListRef.current.scrollToEnd();
                }}
                style={{
                  backgroundColor: theme
                    ? COLORS.lightModeBackground
                    : COLORS.darkModeBackground,
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  bottom: 5,
                  left: '50%',
                  transform: [{translateX: -15}],
                }}>
                <Image
                  style={{
                    width: 20,
                    height: 20,
                    transform: [{rotate: '270deg'}],
                  }}
                  source={ICONS.smallArrowLeft}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      <View style={styles.bottomBar}>
        <TextInput
          onChangeText={setUserChatText}
          autoFocus={true}
          placeholder="Message"
          multiline={true}
          ref={chatRef}
          placeholderTextColor={textTheme}
          style={[
            styles.bottomBarTextInput,
            {color: textTheme, borderColor: textTheme},
          ]}
          value={userChatText}
        />
        <TouchableOpacity
          onPress={submitChaMessage}
          style={{
            width: 30,
            height: 30,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
          }}>
          <Image
            style={{
              width: 20,
              height: 20,
              transform: [{rotate: '90deg'}],
            }}
            source={ICONS.smallArrowLeft}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  function closeChat() {
    if (newChats.length === 0) {
      props.navigation.navigate('App Store');
      return;
    }
    navigate.navigate('ConfirmLeaveChatGPT', {
      wantsToSaveChat: setWantsToLeave,
    });
  }

  async function submitChaMessage() {
    if (userChatText.length === 0) return;

    if (totalAvailableCredits < 30) {
      navigate.navigate('AddChatGPTCredits', {navigation: props.navigation});
      return;
    }
    chatRef.current.focus();

    // const uuid = randomUUID();
    let chatObject = {};
    chatObject['content'] = userChatText;
    // chatObject['uuid'] = uuid;
    chatObject['role'] = 'user';

    setNewChats(prev => {
      prev.push(chatObject);
      return prev;
    });
    setUserChatText('');

    getChatResponse(chatObject);
  }

  async function getChatResponse() {
    try {
      let tempAmount = totalAvailableCredits;
      let chatObject = {};
      chatObject['role'] = 'assistant';
      chatObject['content'] = '';
      setNewChats(prev => {
        prev.push(chatObject);
        return prev;
      });

      const response = await axios.post(
        process.env.GPT_URL,
        JSON.stringify({
          authToken: btoa(process.env.GPT_AUTH_KEY),
          messages: chatHistory.conversation,
        }),
      );

      if (response.status === 200) {
        // calculate price
        const data = response.data;
        const [textInfo] = data.choices;
        const inputPrice = 0.5 / 1000000;
        const outputPrice = 0.5 / 1000000;
        const satsPerDollar = SATSPERBITCOIN / nodeInformation.fiatStats.value;

        const price =
          inputPrice * data.usage.prompt_tokens +
          outputPrice * data.usage.completion_tokens;

        const apiCallCost = price * satsPerDollar; //sats
        const blitzCost = Math.ceil(
          apiCallCost + 5 + Math.ceil(apiCallCost * 0.005),
        );

        setNewChats(prev => {
          prev.pop();
          prev.push({
            content: textInfo.message.content,
            role: textInfo.message.role,
          });
          return prev;
        });

        tempAmount -= blitzCost;

        toggleMasterInfoObject({
          chatGPT: {
            conversation: masterInfoObject.chatGPT.conversation,
            credits: tempAmount,
          },
        });
      } else throw new Error('Not able to get response');
    } catch (err) {
      setNewChats(prev => {
        prev.pop();
        prev.push({role: 'assistant', content: 'Error with request'});

        return prev;
      });

      console.log(err, 'ERR');
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...CENTER,
  },
  topBarText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
    transform: [{translateX: -5}],
  },
  topBarIcon: {
    width: 30,
    height: 30,
  },

  noChatHistoryImgContainer: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },

  bottomBar: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...CENTER,
    paddingBottom: 5,
    paddingTop: 5,
  },

  bottomBarTextInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    fontSize: SIZES.small,
    fontFamily: FONT.Title_Regular,

    marginRight: 10,

    borderRadius: 20,
    borderWidth: 1,
  },
});
