import {useNavigation} from '@react-navigation/native';
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
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {useEffect, useState} from 'react';

export default function ChatGPTHome() {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();
  const textTheme = theme ? COLORS.darkModeText : COLORS.lightModeText;
  const [chatHistory, setChatHistory] = useState([]);
  const [wantsToLeave, setWantsToLeave] = useState(null);

  useEffect(() => {
    // load chat history
  }, []);

  useEffect(() => {
    if (wantsToLeave === null) return;
    if (!wantsToLeave) {
      navigate.goBack();
      return;
    }

    // Save chat history here
  }, [wantsToLeave]);

  return (
    <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => {
                closeChat();
                // navigate.goBack();
              }}>
              <Image
                style={[styles.topBarIcon, {transform: [{translateX: -6}]}]}
                source={ICONS.smallArrowLeft}
              />
            </TouchableOpacity>

            <Text style={[styles.topBarText, {color: textTheme}]}>
              ChatGPT 4
            </Text>

            <TouchableOpacity>
              <Image
                style={{height: 20, width: 20}}
                source={ICONS.drawerList}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.container}>
              {chatHistory.length === 0 ? (
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
                chatHistory
              )}
            </ScrollView>
          </View>
          <View style={styles.bottomBar}>
            <TextInput
              placeholder="Message"
              placeholderTextColor={textTheme}
              style={[
                styles.bottomBarTextInput,
                {color: textTheme, borderColor: textTheme},
              ]}
            />
            <TouchableOpacity
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
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  function closeChat() {
    navigate.navigate('ConfirmLeaveChatGPT', {
      wantsToSaveChat: setWantsToLeave,
    });
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
