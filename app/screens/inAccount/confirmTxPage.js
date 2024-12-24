import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  useWindowDimensions,
  TextInput,
  ScrollView,
} from 'react-native';
import {BTN, COLORS, FONT, ICONS, SIZES} from '../../constants';

import {useNavigation} from '@react-navigation/native';

import {useGlobalContextProvider} from '../../../context-store/context';
import {useEffect, useRef, useState} from 'react';
import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import handleBackPress from '../../hooks/handleBackPress';
import Svg, {Circle, Path} from 'react-native-svg';
import CustomButton from '../../functions/CustomElements/button';
import {updateLiquidWalletInformation} from '../../functions/liquidWallet';
import LottieView from 'lottie-react-native';
import FormattedSatText from '../../functions/CustomElements/satTextDisplay';
import {
  copyToClipboard,
  formatBalanceAmount,
  numberConverter,
} from '../../functions';
import GetThemeColors from '../../hooks/themeColors';
import {openComposer} from 'react-native-email-link';

export default function ConfirmTxPage(props) {
  const navigate = useNavigation();
  const {backgroundOffset} = GetThemeColors();
  const {masterInfoObject, nodeInformation, theme, darkModeType} =
    useGlobalContextProvider();
  const screenWidth = useWindowDimensions().width;
  const paymentType = props.route.params?.for;
  const paymentInformation = props.route.params?.information;
  const fromPage = props.route.params?.fromPage;
  const formmatingType = props.route.params?.formattingType;

  console.log(props.route.params);
  console.log(props.route.params.information);

  const didSucceed =
    formmatingType === 'liquidNode'
      ? paymentInformation?.status === 'pending'
      : formmatingType === 'lightningNode'
      ? paymentInformation.payment.status
      : paymentInformation.status === 'complete';

  const didUseLiquid =
    paymentInformation?.details?.type === 'liquid' ||
    !!paymentInformation?.details?.swapId;

  const paymentFee =
    formmatingType === 'liquidNode'
      ? paymentInformation?.feesSat
      : formmatingType === 'lightningNode'
      ? Math.round(paymentInformation.payment.feeMsat / 1000)
      : paymentInformation?.feeSat;
  const paymentNetwork =
    formmatingType === 'liquidNode'
      ? paymentInformation?.details.type
      : formmatingType === 'lightningNode'
      ? 'Lightning'
      : 'eCash';
  const errorMessage =
    !didSucceed && formmatingType === 'liquidNode'
      ? JSON.stringify(paymentInformation.details.error)
      : formmatingType === 'lightningNode'
      ? JSON.stringify(paymentInformation.payment.error)
      : JSON.stringify(paymentInformation.details.error);

  const amount =
    formmatingType === 'liquidNode'
      ? paymentInformation?.amountSat
      : formmatingType === 'lightningNode'
      ? Math.round(paymentInformation.payment.amountMsat / 1000)
      : paymentInformation?.amountSat;

  console.log(paymentInformation);

  // console.log(paymentInformation, 'PAUYMENT INFO');

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  return (
    <GlobalThemeView
      useStandardWidth={true}
      styles={{
        flex: 1,
        alignItems: 'center',
      }}>
      <LottieView
        source={
          didSucceed
            ? theme
              ? darkModeType
                ? require('../../assets/confirmTxAnimationLightsOutMode.json')
                : require('../../assets/confirmTxAnimationDarkMode.json')
              : require('../../assets/confirmTxAnimation.json')
            : theme
            ? darkModeType
              ? require('../../assets/errorTxAnimationLightsOutMode.json')
              : require('../../assets/errorTxAnimationDarkMode.json')
            : require('../../assets/errorTxAnimation.json')
        }
        autoPlay
        speed={1}
        loop={false}
        style={{
          width: useWindowDimensions().width / 1.5,
          height: useWindowDimensions().width / 1.5,
        }}
      />
      <ThemeText
        styles={{fontWeight: 400, fontSize: SIZES.large, marginBottom: 10}}
        content={
          !didSucceed
            ? 'Failed to send'
            : `${
                paymentType?.toLowerCase() === 'paymentsucceed'
                  ? 'Sent'
                  : 'Received'
              } succesfully`
        }
      />

      {didSucceed && (
        <FormattedSatText
          styles={{fontSize: SIZES.huge, marginBottom: 10}}
          formattedBalance={formatBalanceAmount(
            numberConverter(
              amount,
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
              masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
            ),
          )}
        />
      )}

      <ThemeText
        styles={{
          opacity: 0.6,
          width: 180,
          textAlign: 'center',
          marginBottom: 40,
        }}
        content={
          didSucceed
            ? didUseLiquid
              ? 'Your balance will be updated shortly'
              : ''
            : 'There was an issue sending this payment, please try again.'
        }
      />

      {didSucceed && (
        <View style={styles.paymentTable}>
          <View style={styles.paymentTableRow}>
            <ThemeText content={'Fee'} />
            <FormattedSatText
              formattedBalance={formatBalanceAmount(
                numberConverter(
                  paymentFee,
                  masterInfoObject.userBalanceDenomination,
                  nodeInformation,
                  masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
                ),
              )}
            />
          </View>
          <View style={styles.paymentTableRow}>
            <ThemeText content={'Type'} />
            <ThemeText content={paymentNetwork} />
          </View>
        </View>
      )}
      {!didSucceed && (
        <View
          style={{
            backgroundColor: backgroundOffset,
            borderRadius: 8,
            width: 250,
            height: 100,

            color: 'red',
          }}>
          <ScrollView contentContainerStyle={{padding: 10}}>
            <ThemeText content={errorMessage} />
          </ScrollView>
        </View>
      )}
      {!didSucceed && (
        <TouchableOpacity
          onPress={async () => {
            try {
              await openComposer({
                to: 'blake@blitz-wallet.com',
                subject: 'Payment Failed',
                message: errorMessage,
              });
            } catch (err) {
              copyToClipboard('blake@blitz-wallet.com', navigate);
            }
          }}>
          <ThemeText
            styles={{marginTop: 10}}
            content={'Send report to developer'}
          />
        </TouchableOpacity>
      )}

      <CustomButton
        buttonStyles={{
          width: 'auto',
          backgroundColor:
            didSucceed && !theme ? COLORS.primary : COLORS.darkModeText,
          marginTop: 'auto',
          paddingHorizontal: 15,
        }}
        textStyles={{
          ...styles.buttonText,
          color:
            didSucceed && !theme ? COLORS.darkModeText : COLORS.lightModeText,
        }}
        actionFunction={() => {
          if (fromPage === 'sendSMSPage') {
            navigate.goBack();
            return;
          }
          props.navigation.reset({
            index: 0, // The index of the route to focus on
            routes: [{name: 'HomeAdmin'}], // Array of routes to set in the stack
          });
        }}
        textContent={fromPage === 'sendSMSPage' ? 'Back' : 'Continue'}
      />
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
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
  },
  lottie: {
    width: 300, // adjust as necessary
    height: 300, // adjust as necessary
  },
  paymentTable: {
    rowGap: 20,
  },
  paymentTableRow: {
    width: 200,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
