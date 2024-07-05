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
import {GlobalThemeView} from '../../functions/CustomElements';

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
    <GlobalThemeView
      styles={{
        backgroundColor:
          paymentType?.toLowerCase() != 'paymentfailed'
            ? COLORS.nostrGreen
            : COLORS.cancelRed,
        alignItems: 'center',
      }}>
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
          navigate.navigate('HomeAdmin');
        }}
        style={[
          BTN,
          {
            height: 'auto',
            width: 'auto',
            backgroundColor: COLORS.darkModeText,
            marginTop: 'auto',
            paddingVertical: 8,
            paddingHorizontal: 30,
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
      {paymentType != 'paymentfailed' && (
        <Text
          style={[
            styles.paymentConfirmedMessage,
            {color: COLORS.darkModeText},
          ]}>
          Your payment has been received, and your balance will be updated
          shortly!
        </Text>
      )}
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  popupContainer: {
    flex: 1,
  },

  buttonText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.large,
  },
  paymentConfirmedMessage: {
    width: '90%',
    fontSize: SIZES.medium,

    fontFamily: FONT.Title_Regular,
    textAlign: 'center',
    marginTop: 20,
    // marginBottom: 60,
  },
});
