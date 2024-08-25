import {SafeAreaView, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA} from '../../../../../../../constants/styles';
import {COLORS} from '../../../../../../../constants';
import {ThemeText} from '../../../../../../../functions/CustomElements';
import {useState} from 'react';
import {useGlobalContextProvider} from '../../../../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';

export default function ChatGPTVoiceFeature() {
  const {masterInfoObject} = useGlobalContextProvider();
  const insets = useSafeAreaInsets();
  const navigate = useNavigation();
  const [totalAvailableCredits, setTotalAvailableCredits] = useState(
    masterInfoObject.chatGPT.credits,
  );
  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top < ANDROIDSAFEAREA ? ANDROIDSAFEAREA : insets.top,
        paddingTop:
          insets.bottom < ANDROIDSAFEAREA ? ANDROIDSAFEAREA : insets.bottom,
        backgroundColor: COLORS.darkModeBackground,
      }}>
      <View>
        <TouchableOpacity onPress={navigate.goBack}>
          <ThemeText
            styles={{
              textAlign: 'center',
              color: COLORS.darkModeText,
            }}
            content={`Available credits: ${totalAvailableCredits.toFixed(2)}`}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
