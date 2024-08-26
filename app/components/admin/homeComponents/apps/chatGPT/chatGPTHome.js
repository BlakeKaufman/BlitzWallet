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
  Platform,
} from 'react-native';
import {
  CENTER,
  CHATGPT_INPUT_COST,
  CHATGPT_OUTPUT_COST,
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
import {useDrawerStatus} from '@react-navigation/drawer';
import {copyToClipboard} from '../../../../../functions';
import ContextMenu from 'react-native-context-menu-view';
import {
  decryptMessage,
  encriptMessage,
} from '../../../../../functions/messaging/encodingAndDecodingMessages';
import * as nostr from 'nostr-tools';
import {backArrow} from '../../../../../constants/styles';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import {SHADOWS, WINDOWWIDTH} from '../../../../../constants/theme';
import handleBackPress from '../../../../../hooks/handleBackPress';
import ExampleGPTSearchCard from './exampleSearchCards';
import saveChatGPTChat from './functions/saveChat';
import Icon from '../../../../../functions/CustomElements/Icon';

export default function ChatGPTHome(props) {
  const navigate = useNavigation();
  const {
    theme,
    nodeInformation,
    userBalanceDenomination,
    masterInfoObject,
    toggleMasterInfoObject,
    JWT,
    contactsPrivateKey,
  } = useGlobalContextProvider();
  const flatListRef = useRef(null);
  const textTheme = theme ? COLORS.darkModeText : COLORS.lightModeText;
  const [chatHistory, setChatHistory] = useState({
    conversation: [],
    uuid: '',
    lastUsed: '',
    firstQuery: '',
  });
  const [newChats, setNewChats] = useState([]);
  // const [wantsToLeave, setWantsToLeave] = useState(null);
  const [userChatText, setUserChatText] = useState('');
  const [totalAvailableCredits, setTotalAvailableCredits] = useState(
    masterInfoObject.chatGPT.credits,
  );
  // const totalAvailableCredits = masterInfoObject.chatGPT.credits;
  const [showScrollBottomIndicator, setShowScrollBottomIndicator] =
    useState(false);

  function handleBackPressFunction() {
    Keyboard.dismiss();
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  const conjoinedLists = [...chatHistory.conversation, ...newChats];

  useEffect(() => {
    if (!props.route.params?.chatHistory) return;
    const loadedChatHistory = JSON.parse(
      JSON.stringify(props.route.params.chatHistory),
    );

    setChatHistory(loadedChatHistory);
  }, []);

  const flatListItem = ({item}) => {
    return (
      <ContextMenu
        onPress={e => {
          const targetEvent = e.nativeEvent.name.toLowerCase();
          if (targetEvent === 'copy') {
            copyToClipboard(item.content, navigate, 'ChatGPT');
          } else {
            setUserChatText(item.content);
            // chatRef.current.focus();
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
            marginVertical: 10,
          }}>
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
    <GlobalThemeView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{
          flex: 1,
        }}>
        <View
          style={{
            flex: 1,
            width: WINDOWWIDTH,
            ...CENTER,
          }}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={closeChat}>
              <Image
                style={[styles.topBarIcon, {transform: [{translateX: -6}]}]}
                source={ICONS.smallArrowLeft}
              />
            </TouchableOpacity>

            <Text style={[styles.topBarText, {color: textTheme}]}>
              ChatGPT 4o
            </Text>

            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                props.navigation.openDrawer();
              }}>
              <Image style={[backArrow]} source={ICONS.drawerList} />
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
              Available credits: {totalAvailableCredits.toFixed(2)}
              {/* {userBalanceDenomination === 'sats'
              ? 'sats'
              : nodeInformation.fiatStats.coin}{' '} */}
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
                  <Image
                    style={{width: 20, height: 20}}
                    source={ICONS.logoIcon}
                  />
                </View>
              </View>
            ) : (
              <View
                style={{
                  flex: 1,
                  marginTop: 20,
                  position: 'relative',
                  // alignItems: 'center',
                }}>
                <FlatList
                  keyboardShouldPersistTaps="handled"
                  ref={flatListRef}
                  inverted
                  onScroll={e => {
                    const offset = e.nativeEvent.contentOffset.y;

                    if (offset > 20) setShowScrollBottomIndicator(true);
                    else setShowScrollBottomIndicator(false);
                  }}
                  scrollEnabled={true}
                  showsHorizontalScrollIndicator={false}
                  data={conjoinedLists}
                  renderItem={flatListItem}
                  key={item => item.uuid}
                  contentContainerStyle={{
                    flexDirection: 'column-reverse',
                  }}
                />
                {showScrollBottomIndicator && (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      flatListRef.current.scrollToEnd();
                    }}
                    style={{
                      backgroundColor: theme
                        ? COLORS.darkModeBackgroundOffset
                        : COLORS.lightModeBackgroundOffset,
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'absolute',
                      bottom: 5,
                      left: '50%',
                      transform: [{translateX: -20}],
                      ...SHADOWS.small,
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

          {chatHistory.conversation.length === 0 &&
            userChatText.length === 0 &&
            newChats.length === 0 && (
              <ExampleGPTSearchCard
                submitChaMessage={submitChaMessage}
                setUserChatText={setUserChatText}
              />
            )}
          <View style={styles.bottomBarContainer}>
            <TextInput
              onChangeText={setUserChatText}
              autoFocus={true}
              placeholder="Message"
              multiline={true}
              // ref={chatRef}
              placeholderTextColor={textTheme}
              style={[
                styles.bottomBarTextInput,
                {color: textTheme, borderColor: textTheme},
              ]}
              value={userChatText}
            />
            <TouchableOpacity
              onPress={() => {
                if (userChatText.length === 0) {
                  Keyboard.dismiss();
                  navigate.navigate('ChatGPTVoiceFeature');

                  return;
                }
                submitChaMessage(userChatText);
              }}
              style={{
                width: userChatText.length === 0 ? 30 : 30,
                height: userChatText.length === 0 ? 30 : 30,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20,
                backgroundColor:
                  userChatText.length === 0
                    ? 'transparent'
                    : theme
                    ? COLORS.lightModeBackground
                    : COLORS.darkModeBackground,

                opacity: userChatText.length === 0 ? 1 : 1,
              }}>
              {userChatText.length === 0 ? (
                <Image
                  style={{
                    width: userChatText.length === 0 ? 30 : 20,
                    height: userChatText.length === 0 ? 30 : 20,

                    transform: [
                      {rotate: userChatText.length === 0 ? '0deg' : '90deg'},
                    ],
                  }}
                  source={
                    userChatText.length === 0
                      ? ICONS.headphones
                      : ICONS.smallArrowLeft
                  }
                />
              ) : (
                <Icon
                  width={25}
                  height={25}
                  color={theme ? COLORS.lightModeText : COLORS.darkModeText}
                  name={'arrow'}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </GlobalThemeView>
  );

  function closeChat() {
    Keyboard.dismiss();
    if (newChats.length === 0) {
      props.navigation.navigate('App Store');
      return;
    }
    navigate.setOptions({
      wantsToSave: () =>
        saveChatGPTChat({
          contactsPrivateKey,
          masterInfoObject,
          chatHistory,
          newChats,
          toggleMasterInfoObject,
          navigation: props.navigation,
          navigate,
        }),
      doesNotWantToSave: () => props.navigation.navigate('App Store'),
    });
    navigate.navigate('ConfirmLeaveChatGPT', {
      // wantsToSaveChat: setWantsToLeave,
      wantsToSave: () =>
        saveChatGPTChat({
          contactsPrivateKey,
          masterInfoObject,
          chatHistory,
          newChats,
          toggleMasterInfoObject,
          navigation: props.navigation,
          navigate,
        }),
      doesNotWantToSave: () => props.navigation.navigate('App Store'),
    });
  }

  async function submitChaMessage(forcedText) {
    if (!forcedText) {
      if (userChatText.length === 0 || userChatText.trim() === '') return;

      if (totalAvailableCredits < 30) {
        navigate.navigate('AddChatGPTCredits', {navigation: props.navigation});
        return;
      }
    }

    let textToSend = typeof forcedText === 'object' ? userChatText : forcedText;

    let userChatObject = {};
    let GPTChatObject = {};
    userChatObject['content'] = textToSend;
    // userChatObject['uuid'] = uuid;
    userChatObject['role'] = 'user';
    userChatObject['time'] = new Date();

    GPTChatObject['role'] = 'assistant';
    GPTChatObject['content'] = '';
    GPTChatObject['time'] = new Date();

    setNewChats(prev => [...prev, userChatObject, GPTChatObject]);
    setUserChatText('');

    getChatResponse(userChatObject);
  }

  async function getChatResponse(userChatObject) {
    try {
      let tempAmount = totalAvailableCredits;
      let tempArr = [...conjoinedLists];
      tempArr.push(userChatObject);

      const response = await axios.post(
        process.env.GPT_URL,
        JSON.stringify({messages: tempArr}),
        {
          headers: {
            Authorization: `${JWT}`,
          },
        },
      );

      if (response.status === 200) {
        // calculate price
        const data = response.data;
        const [textInfo] = data.choices;
        // const inputPrice = 0.5 / 1000000;
        // const outputPrice = 0.5 / 1000000;
        const satsPerDollar =
          SATSPERBITCOIN / (nodeInformation.fiatStats.value || 60000);

        const price =
          CHATGPT_INPUT_COST * data.usage.prompt_tokens +
          CHATGPT_OUTPUT_COST * data.usage.completion_tokens;

        const apiCallCost = price * satsPerDollar; //sats

        const blitzCost = Math.ceil(
          apiCallCost + 20 + Math.ceil(apiCallCost * 0.005),
        );
        tempAmount -= blitzCost;

        setNewChats(prev => {
          let tempArr = [...prev];
          tempArr.pop();
          tempArr.push({
            content: textInfo.message.content,
            role: textInfo.message.role,
          });
          return tempArr;
        });

        setTotalAvailableCredits(tempAmount);

        toggleMasterInfoObject({
          chatGPT: {
            conversation: masterInfoObject.chatGPT.conversation,
            credits: tempAmount,
          },
        });
      } else throw new Error('Not able to get response');
    } catch (err) {
      setNewChats(prev => {
        let tempArr = [...prev];
        tempArr.pop();
        tempArr.push({role: 'assistant', content: 'Error with request'});

        return tempArr;
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
    width: '100%',
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

  bottomBarContainer: {
    width: '100%',
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
    maxHeight: 150,

    marginRight: 10,

    borderRadius: 20,
    borderWidth: 1,
  },
});
