import {Platform, StyleSheet, useWindowDimensions, View} from 'react-native';
import SwipeButton from 'rn-swipe-button';
import GetThemeColors from '../../../../../hooks/themeColors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA, CENTER} from '../../../../../constants/styles';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {ThemeText} from '../../../../../functions/CustomElements';
import {COLORS, SIZES} from '../../../../../constants';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';
import {breezLiquidReceivePaymentWrapper} from '../../../../../functions/breezLiquid';
import {receivePayment} from '@breeztech/react-native-breez-sdk';
import {calculateBoltzFeeNew} from '../../../../../functions/boltz/boltzFeeNew';
import {useGlobalThemeContext} from '../../../../../../context-store/theme';
import {useNodeContext} from '../../../../../../context-store/nodeContext';
export default function ConfirmInternalTransferHalfModal(props) {
  const {backgroundColor, backgroundOffset, textColor} = GetThemeColors();
  const {masterInfoObject, minMaxLiquidSwapAmounts} =
    useGlobalContextProvider();
  const {nodeInformation, liquidNodeInformation} = useNodeContext();
  const {theme, darkModeType} = useGlobalThemeContext();
  const insets = useSafeAreaInsets();
  const navigate = useNavigation();
  const [invoiceInfo, setInvoiceInfo] = useState({
    fee: null,
    invoice: '',
  });

  const bottomPadding = Platform.select({
    ios: insets.bottom,
    android: ANDROIDSAFEAREA,
  });

  const {amount, startTransferFunction, transferInfo} = props;

  useEffect(() => {
    async function retriveSwapInformation() {
      let address;
      let receiveFee = 0;

      if (['lightning', 'ecash'].includes(transferInfo.from.toLowerCase())) {
        const response = await breezLiquidReceivePaymentWrapper({
          sendAmount: amount,
          paymentType: 'lightning',
          description: 'Internal_Transfer',
        });
        if (!response) {
          navigate.navigate('ErrorScreen', {
            errorMessage: 'Unable to generate invoice',
          });
          return;
        }
        const {destination, receiveFeesSat} = response;

        address = destination;
        receiveFee =
          receiveFeesSat +
          (transferInfo.from.toLowerCase() === 'ecash'
            ? 5
            : Math.round(amount * 0.005) + 4);
        console.log('GENERATING LN to LIQUID INVOICE');
      } else {
        const response = await receivePayment({
          amountMsat: amount * 1000,
          description: 'Internal_Transfer',
        });
        if (response.openingFeeMsat) {
          navigate.navigate('ErrorScreen', {
            errorMessage:
              'Payment will create a new channel. Please send a smaller amount.',
          });
          return;
        }
        address = response.lnInvoice.bolt11;
        receiveFee =
          26 +
          calculateBoltzFeeNew(
            amount,
            'liquid-ln',
            minMaxLiquidSwapAmounts.submarineSwapStats,
          );
        console.log('GENERATING LIQUID to LN INVOICE');
      }
      setInvoiceInfo({
        fee: receiveFee,
        invoice: address,
      });
    }
    retriveSwapInformation();
  }, []);

  return (
    <View
      style={{
        height: 350,
        width: '100%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingBottom: bottomPadding,
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: backgroundOffset,
          },
        ]}
      />
      {!invoiceInfo.fee || !invoiceInfo.invoice ? (
        <FullLoadingScreen />
      ) : (
        <>
          <ThemeText
            styles={{
              fontSize: SIZES.xLarge,
              textAlign: 'center',
            }}
            content={`Confirm transfer`}
          />
          <FormattedSatText
            frontText={`Amount: `}
            containerStyles={{marginTop: 'auto'}}
            styles={{fontSize: SIZES.large}}
            balance={amount}
          />
          <FormattedSatText frontText={`Fee: `} balance={invoiceInfo.fee} />

          <SwipeButton
            containerStyles={{
              width: '90%',
              maxWidth: 350,
              borderColor: textColor,
              ...CENTER,
              marginBottom: 20,
              marginTop: 'auto',
            }}
            titleStyles={{fontWeight: 'bold', fontSize: SIZES.large}}
            swipeSuccessThreshold={100}
            onSwipeSuccess={() => {
              navigate.goBack();
              startTransferFunction({
                invoice: invoiceInfo.invoice,
                transferInfo,
              });
            }}
            railBackgroundColor={theme ? COLORS.darkModeText : COLORS.primary}
            railBorderColor={
              theme ? backgroundColor : COLORS.lightModeBackground
            }
            height={55}
            railStyles={{
              backgroundColor: theme ? backgroundColor : COLORS.darkModeText,
              borderColor: theme ? backgroundColor : COLORS.darkModeText,
            }}
            thumbIconBackgroundColor={
              theme ? backgroundColor : COLORS.darkModeText
            }
            thumbIconBorderColor={theme ? backgroundColor : COLORS.darkModeText}
            titleColor={theme ? backgroundColor : COLORS.darkModeText}
            title="Slide to confirm"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: 120,
    height: 8,
    marginTop: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  borderTop: {
    width: '100%',
    height: 60,
    position: 'absolute',
    top: -5,
    zIndex: -1,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});
