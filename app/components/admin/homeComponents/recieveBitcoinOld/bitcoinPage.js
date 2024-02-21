import {
  inProgressSwap,
  listRefundables,
  openChannelFee,
  receiveOnchain,
  receivePayment,
} from '@breeztech/react-native-breez-sdk';
import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {COLORS, CENTER, FONT, SIZES, BTN} from '../../../../constants';
import QRCode from 'react-native-qrcode-svg';
import Slider from '@react-native-community/slider';
import * as Clipboard from 'expo-clipboard';
import {useNavigation} from '@react-navigation/native';

export default function BitcoinPage(props) {
  const [generatingQrCode, setGeneratingQrCode] = useState(true);
  const [bitcoinSwapInfo, setBitcoinSwapInfo] = useState({
    minAllowedDeposit: 0,
    maxAllowedDeposit: 0,
  });
  const [lnFee, setLnFee] = useState({
    receivingAmount: 0,
    lnFee: 0,
  });
  const [inPorgressSwapInfo, setInProgressSwapInfo] = useState({});
  const navigate = useNavigation();
  const [errorMessageText, setErrorMessageText] = useState('');

  useEffect(() => {
    if (props.selectedRecieveOption != 'bitcoin') return;

    (async () => {
      try {
        initSwap();
      } catch (err) {
        setErrorMessageText('Error cannot generate receiving address');
        console.log(err);
      }
    })();
  }, [props.selectedRecieveOption]);
  // return null;
  return (
    <View
      style={{
        flex: 1,
        display: props.selectedRecieveOption === 'bitcoin' ? 'flex' : 'none',
      }}>
      {Object.keys(inPorgressSwapInfo).length === 0 ? (
        <>
          <View style={[styles.qrcodeContainer]}>
            {generatingQrCode && (
              <ActivityIndicator
                size="large"
                color={props.theme ? COLORS.darkModeText : COLORS.lightModeText}
                style={{marginTop: 'auto', marginBottom: 'auto'}}
              />
            )}
            {!generatingQrCode && (
              <>
                <QRCode
                  size={200}
                  value={
                    props.generatedAddress.bitcoin
                      ? props.generatedAddress.bitcoin
                      : 'Thanks for using Blitz!'
                  }
                  color={
                    props.theme ? COLORS.darkModeText : COLORS.lightModeText
                  }
                  backgroundColor={
                    props.theme
                      ? COLORS.darkModeBackground
                      : COLORS.lightModeBackground
                  }
                />
                <TouchableOpacity
                  onPress={() => {
                    copyToClipboard(props.generatedAddress.bitcoin);
                  }}>
                  <Text style={styles.btcAddressText}>
                    {props.generatedAddress.bitcoin}
                  </Text>
                </TouchableOpacity>
              </>
            )}
            <Text
              style={{
                fontSize: SIZES.large,
                color: COLORS.cancelRed,
                ...CENTER,
                textAlign: 'center',
              }}>
              {errorMessageText ? errorMessageText : ' '}
            </Text>
          </View>
          {!generatingQrCode && (
            <View style={styles.sliderContainer}>
              {/* <Text
                style={[
                  styles.feeHeaderText,
                  {
                    color: props.theme
                      ? COLORS.darkModeText
                      : COLORS.lightModeText,
                  },
                ]}>
                Lightning Fee Calculator
              </Text> */}

              {/* <Slider
                onSlidingComplete={handleFeeSlider}
                style={styles.sliderStyle}
                minimumValue={bitcoinSwapInfo.minAllowedDeposit}
                maximumValue={bitcoinSwapInfo.maxAllowedDeposit}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={
                  props.theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset
                }
              /> */}
              <View style={[styles.feeeBreakdownContainer]}>
                <View style={styles.feeBreakdownRow}>
                  <Text
                    style={[
                      styles.feeBreakdownDescriptor,
                      {
                        color: props.theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    Min Receivable (sat)
                  </Text>
                  <Text
                    style={[
                      styles.feeBreakdownValue,
                      {
                        color: props.theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    {bitcoinSwapInfo.minAllowedDeposit.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.feeBreakdownRow}>
                  <Text
                    style={[
                      styles.feeBreakdownDescriptor,
                      {
                        color: props.theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    Max Receivable (sat)
                  </Text>
                  <Text
                    style={[
                      styles.feeBreakdownValue,
                      {
                        color: props.theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    {bitcoinSwapInfo.maxAllowedDeposit.toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.warningText}>
                  Sending an amount smaller than the minimum or larger than the
                  maximum will cause the swap to fail.
                </Text>
                {/* <View style={styles.feeBreakdownRow}>
                  <Text
                    style={[
                      styles.feeBreakdownDescriptor,
                      {
                        color: props.theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    Receiving amount (sat)
                  </Text>
                  <Text
                    style={[
                      styles.feeBreakdownValue,
                      {
                        color: props.theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    {lnFee.receivingAmount.toLocaleString()}
                  </Text>
                </View> */}
                {/* <View style={styles.feeBreakdownRow}>
                  <Text
                    style={[
                      styles.feeBreakdownDescriptor,
                      {
                        color: props.theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    Lightning Fee (sat)
                  </Text>
                  <Text
                    style={[
                      styles.feeBreakdownValue,
                      {
                        color: props.theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    {lnFee.lnFee.toLocaleString()}
                  </Text>
                </View> */}
              </View>
              <TouchableOpacity
                style={[
                  BTN,
                  {
                    height: 40,
                    width: 150,
                    marginTop: 'auto',
                    marginBottom: 0,
                    backgroundColor: COLORS.primary,
                    ...CENTER,
                  },
                ]}
                onPress={() => {
                  monitorSwap();
                }}>
                <Text
                  style={{
                    fontFamily: FONT.Descriptoin_Regular,
                    color: COLORS.darkModeText,
                  }}>
                  Monitor Swap
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        <View style={styles.confirmingSwapContainer}>
          <Text
            style={[
              styles.confirmingSwapHeader,
              {color: props.theme ? COLORS.darkModeText : COLORS.lightModeText},
            ]}>
            Swap in progress
          </Text>
          <ActivityIndicator
            size="large"
            color={props.theme ? COLORS.darkModeText : COLORS.lightModeText}
            style={{marginVertical: 50}}
          />
          <View style={{width: '90%', ...CENTER}}>
            <Text style={styles.confirmingSwapTXID}>Tx id:</Text>
            <TouchableOpacity
              onPress={() =>
                copyToClipboard(inPorgressSwapInfo.unconfirmedTxIds[0])
              }>
              <Text
                style={{
                  fontFamily: FONT.Descriptoin_Regular,
                  fontSize: SIZES.medium,
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                }}>
                {inPorgressSwapInfo.unconfirmedTxIds[0]}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.swapErrorMessage}>
            Swaps become refundable after 288 blocks or around 2 days. If your
            swap has not come through before then, come back to this page and
            click the button below.
          </Text>
          <TouchableOpacity
            style={[BTN, {backgroundColor: COLORS.primary}]}
            onPress={() => navigate.navigate('RefundBitcoinTransactionPage')}>
            <Text
              style={{
                color: COLORS.darkModeText,
                fontFamily: FONT.Descriptoin_Regular,
              }}>
              Issue refund
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  async function initSwap() {
    try {
      setGeneratingQrCode(true);
      const swapInfo = await receiveOnchain({});
      const openChannelFeeResponse = await openChannelFee({
        amountMsat: swapInfo.minAllowedDeposit * 1000,
      });

      props.setGeneratedAddress(prev => {
        return {...prev, bitcoin: swapInfo.bitcoinAddress};
      });
      setBitcoinSwapInfo({
        minAllowedDeposit: swapInfo.minAllowedDeposit,
        maxAllowedDeposit: swapInfo.maxAllowedDeposit,
      });
      setLnFee({
        lnFee: openChannelFeeResponse.feeMsat / 1000,
        receivingAmount: swapInfo.minAllowedDeposit,
      });

      setGeneratingQrCode(false);
    } catch (err) {
      console.log(err);
      monitorSwap();
    }
  }

  async function monitorSwap() {
    try {
      const swapInfo = await inProgressSwap();
      if (!swapInfo) return;
      setInProgressSwapInfo(swapInfo);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleFeeSlider(e) {
    console.log(Math.round(e));

    try {
      const openChannelFeeResponse = await openChannelFee({
        amountMsat: Number(Math.round(e)) * 1000,
      });
      setLnFee({
        lnFee: openChannelFeeResponse.feeMsat / 1000,
        receivingAmount: Number(Math.round(e)),
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function copyToClipboard(txID) {
    try {
      await Clipboard.setStringAsync(txID);
      navigate.navigate('ClipboardCopyPopup', {didCopy: true});
      return;
    } catch (err) {
      navigate.navigate('ClipboardCopyPopup', {didCopy: false});
    }
  }
}

const styles = StyleSheet.create({
  qrcodeContainer: {
    width: '95%',
    maxWidth: 350,
    height: 250,
    ...CENTER,

    marginTop: 20,
    marginBottom: 10,

    alignItems: 'center',
    justifyContent: 'center',
  },

  btcAddressText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    marginTop: 5,
    textAlign: 'center',
  },
  sliderStyle: {width: 200, height: 40, ...CENTER},
  sliderContainer: {
    width: '95%',
    flex: 1,
    ...CENTER,
    // marginTop: 20,
  },
  feeHeaderText: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.large,

    textAlign: 'center',
    marginBottom: 20,
  },

  feeeBreakdownContainer: {
    width: '95%',
    maxWidth: 320,
    ...CENTER,
  },

  feeBreakdownRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  feeBreakdownDescriptor: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },
  feeBreakdownValue: {
    fontFamily: FONT.Descriptoin_Bold,
    fontSize: SIZES.medium,
  },
  warningText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Descriptoin_Regular,
    color: COLORS.cancelRed,
    textAlign: 'center',
    marginTop: 20,
  },

  confirmingSwapContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmingSwapHeader: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.large,
    marginBottom: 20,
  },
  confirmingSwapTXID: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginBottom: 5,
  },
  swapErrorMessage: {
    color: COLORS.cancelRed,
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    width: '90%',
    textAlign: 'center',
    marginTop: 20,
  },
});
