import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  useColorScheme,
  ScrollView,
  Dimensions,
} from 'react-native';
import {BTN, COLORS, FONT, ICONS, SIZES} from '../../constants';

import {useNavigation} from '@react-navigation/native';

import {useGlobalContextProvider} from '../../../context-store/context';
import {useEffect} from 'react';
import {getLocalStorageItem, setLocalStorageItem} from '../../functions';
import {removeLocalStorageItem} from '../../functions/localStorage';

export default function ConfirmTxPage(props) {
  const navigate = useNavigation();

  const windowDimensions = Dimensions.get('window');
  const {theme, nodeInformation} = useGlobalContextProvider();
  const paymentType = props.route.params?.for;
  const paymentInformation = props.route.params?.information;
  const didCompleteIcon =
    paymentType?.toLowerCase() != 'paymentfailed'
      ? theme
        ? ICONS.CheckcircleLight
        : ICONS.CheckcircleDark
      : theme
      ? ICONS.XcircleLight
      : ICONS.XcircleDark;

  (async () => {
    try {
      if (paymentInformation.details.payment.description != 'Liquid Swap')
        return;
      try {
        const prevSwapInfo = JSON.parse(
          await getLocalStorageItem('liquidSwapInfo'),
        );
        return;
        prevSwapInfo.pop();
        setLocalStorageItem('liquidSwapInfo', JSON.stringify(prevSwapInfo));
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      console.log(err);
    }
  })();

  return (
    <View
      style={[
        styles.popupContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,

          alignItems: 'center',
        },
      ]}>
      <Image
        style={{width: '100%', height: windowDimensions.height / 2.35}}
        source={ICONS.confirmConfetti}
      />
      <Image
        style={{
          width: 175,
          height: 175,
          position: 'absolute',
          top: windowDimensions.height / 2.35 - 55,
        }}
        source={didCompleteIcon}
      />
      <TouchableOpacity
        onPress={() => {
          navigate.goBack();
        }}
        style={[
          BTN,
          {
            backgroundColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
            marginTop: 'auto',
            marginBottom: 60,
          },
        ]}>
        <Text
          style={[
            styles.buttonText,
            {
              color: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,
            },
          ]}>
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  popupContainer: {
    flex: 1,
  },

  buttonContainer: {
    width: 'auto',
    height: 35,
    marginTop: 'auto',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    padding: 8,
    marginBottom: 60,
  },
  buttonText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
});
