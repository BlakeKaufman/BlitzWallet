import {
  Button,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA, CENTER} from '../../../../../../../constants/styles';
import {COLORS} from '../../../../../../../constants';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../../../functions/CustomElements';
import {useEffect, useState} from 'react';
import {useGlobalContextProvider} from '../../../../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import UserSpeaking from './userSpeaking';
import {WINDOWWIDTH} from '../../../../../../../constants/theme';

export default function ChatGPTVoiceFeature() {
  const {masterInfoObject} = useGlobalContextProvider();
  const insets = useSafeAreaInsets();
  const navigate = useNavigation();
  const [totalAvailableCredits, setTotalAvailableCredits] = useState(
    masterInfoObject.chatGPT.credits,
  );
  // const speak = text => {
  //   try {
  //     Speech.speak(text);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  // useEffect(() => {
  //   navigate.navigate('ErrorScreen', {
  //     errorMessage:
  //       'Make sure your phone is not on silent mode in order to hear the chatGPTs response',
  //   });
  //   // setUpOptions();
  // }, []);
  return (
    <GlobalThemeView
      useStandardWidth={true}
      styles={{
        backgroundColor: COLORS.darkModeBackground,
      }}>
      <View style={{flex: 1}}>
        <TouchableOpacity onPress={navigate.goBack}>
          <ThemeText
            styles={{
              textAlign: 'center',
              color: COLORS.darkModeText,
              marginTop: 20,
            }}
            content={`Available credits: ${totalAvailableCredits.toFixed(2)}`}
          />
        </TouchableOpacity>
        <UserSpeaking
          setTotalAvailableCredits={setTotalAvailableCredits}
          totalAvailableCredits={totalAvailableCredits}
        />
      </View>
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({});
