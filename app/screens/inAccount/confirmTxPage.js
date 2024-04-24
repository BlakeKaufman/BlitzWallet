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

export default function ConfirmTxPage(props) {
  const navigate = useNavigation();

  const windowDimensions = Dimensions.get('window');
  const {theme, masterInfoObject, toggleMasterInfoObject} =
    useGlobalContextProvider();
  const paymentType = props.route.params?.for;
  const paymentInformation = props.route.params?.information;
  const didCompleteIcon =
    paymentType?.toLowerCase() != 'paymentfailed'
      ? ICONS.CheckcircleLight
      : ICONS.XcircleLight;

  // console.log(paymentResponse.payment.paymentType === 'paymentFailed');

  // if (paymentResponse.payment.paymentType === 'paymentFailed') {
  //   const savedFailedPayments = JSON.parse(
  //     await getLocalStorageItem('failedTxs'),
  //   );

  // } ADD THIS CODE TO MAKE SURE I ADD FAILED TX TO THE LIST OF TRASACTIONS

  useEffect(() => {
    try {
      if (paymentType === 'paymentFailed') {
        let savedFailedPayments = masterInfoObject.failedTransactions;

        savedFailedPayments.push(paymentInformation);

        toggleMasterInfoObject({
          failedTransactions: savedFailedPayments,
        });
      }
      // else if (
      //   paymentInformation?.details?.payment?.description != 'Liquid Swap'
      // )
      //   return;
      //   try {
      //     let prevSwapInfo = masterInfoObject.failedLiquidSwaps;

      //     prevSwapInfo.pop();

      //     toggleMasterInfoObject({failedLiquidSwaps: prevSwapInfo});
      //   } catch (err) {
      //     console.log(err);
      //   }
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <View
      style={[
        styles.popupContainer,
        {
          backgroundColor:
            paymentType?.toLowerCase() != 'paymentfailed'
              ? COLORS.nostrGreen
              : COLORS.cancelRed,
          alignItems: 'center',
        },
      ]}>
      {/* <Image
        style={{width: '100%', height: windowDimensions.height / 2.35}}
        source={ICONS.confirmConfetti}
      /> */}
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
          navigate.replace('HomeAdmin');
        }}
        style={[
          BTN,
          {
            backgroundColor: COLORS.darkModeText,
            marginTop: 'auto',
            marginBottom: 60,
          },
        ]}>
        <Text
          style={[
            styles.buttonText,
            {
              color:
                paymentType?.toLowerCase() != 'paymentfailed'
                  ? COLORS.nostrGreen
                  : COLORS.cancelRed,
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
