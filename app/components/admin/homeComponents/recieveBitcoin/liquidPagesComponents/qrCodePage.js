import {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View, Text} from 'react-native';
import {COLORS, FONT, SHADOWS, SIZES, CENTER} from '../../../../../constants';

import QRCode from 'react-native-qrcode-svg';
import {
  openChannelFee,
  receivePayment,
} from '@breeztech/react-native-breez-sdk';

import RNEventSource from 'react-native-event-source';
import {createLiquidSwap} from '../../../../../functions/LBTC';
import {useGlobalContextProvider} from '../../../../../../context-store/context';

export default function QrCodePage(props) {
  const [evenSource, setEventSource] = useState({});
  const [errorMessageText, setErrorMessageText] = useState('');
  const [receiveError, setReceiveError] = useState('');
  const {nodeInformation} = useGlobalContextProvider();

  useEffect(() => {
    console.log('QR CODE PAGE');
    (async () => {
      try {
        props.setGeneratingInvoiceQRCode(true);
        const satAmount =
          props.liquidAmount -
          props.feeInfo.liquidFee -
          props.liquidAmount * props.feeInfo.boltzFeePercent;

        const channelFee = await openChannelFee({
          amountMsat: satAmount * 1000,
        });
        if (nodeInformation.inboundLiquidityMsat < satAmount * 1000) {
          setReceiveError(
            `Amount is above your receiving capacity. Sending this payment will incur a ${Math.ceil(
              channelFee.feeMsat / 1000,
            ).toLocaleString()} sat fee`,
          );
        }
        if (channelFee.feeMsat > satAmount * 1000) {
          setErrorMessageText(
            `It costs ${Math.ceil(
              channelFee.feeMsat / 1000,
            ).toLocaleString()} sat to open a channel, but only ${Math.ceil(
              satAmount,
            ).toLocaleString()} sat was requested.`,
          );
          return;
        }

        const invoice = await receivePayment({
          amountMsat: satAmount * 1000,
          description: 'Liquid Swap',
        });

        if (invoice) {
          const swapInfo = await createLiquidSwap(
            invoice.lnInvoice.bolt11,
            props.feeInfo.hash,
          );
          props.setGeneratedAddress(prev => {
            return {...prev, liquid: swapInfo.bip21};
          });

          const eventSource = new RNEventSource(
            'https://api.boltz.exchange/streamswapstatus?id=' + swapInfo.id,
          );
          eventSource.addEventListener('message', event => {
            setEventSource(event.data);
          });
          props.setGeneratingInvoiceQRCode(false);
        }
      } catch (err) {
        console.log(err);
        setErrorMessageText('Error cannot generate receiving address');
      }
    })();
  }, []);

  return (
    <>
      <View style={[styles.qrcodeContainer]}>
        {props.generatingInvoiceQRCode && (
          <ActivityIndicator
            size="large"
            color={props.theme ? COLORS.darkModeText : COLORS.lightModeText}
          />
        )}
        {!props.generatingInvoiceQRCode && (
          <QRCode
            size={250}
            value={
              props.generatedAddress.liquid
                ? props.generatedAddress.liquid
                : 'lets swap'
            }
            color={props.theme ? COLORS.darkModeText : COLORS.lightModeText}
            backgroundColor={
              props.theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground
            }
          />
        )}
      </View>

      {errorMessageText ? (
        <Text
          style={{
            color: COLORS.cancelRed,
            fontFamily: FONT.Descriptoin_Regular,
            fontSize: SIZES.large,
            textAlign: 'center',
          }}>
          {errorMessageText}
        </Text>
      ) : (
        <>
          <View style={styles.transactionStatusContainer}>
            <Text
              style={[
                styles.statusTitle,
                {
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              Status:
            </Text>
            <View style={{height: 80, justifyContent: 'space-between'}}>
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      evenSource === '{"status":"invoice.set"}' ||
                      evenSource === '{"status":"transaction.mempool"}' ||
                      evenSource === '{"status":"invoice.pending"}'
                        ? 'green'
                        : props.theme
                        ? COLORS.darkModeText
                        : COLORS.lightModeText,
                  },
                ]}>
                Invoice Set
              </Text>
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      evenSource === '{"status":"transaction.mempool"}' ||
                      evenSource === '{"status":"invoice.pending"}'
                        ? 'green'
                        : props.theme
                        ? COLORS.darkModeText
                        : COLORS.lightModeText,
                  },
                ]}>
                In mempool
              </Text>
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      evenSource === '{"status":"invoice.pending"}'
                        ? 'green'
                        : props.theme
                        ? COLORS.darkModeText
                        : COLORS.lightModeText,
                  },
                ]}>
                Payment Pending
              </Text>
            </View>
          </View>
          <Text
            style={{
              width: '95%',
              textAlign: 'center',
              color: COLORS.cancelRed,
              fontSize: SIZES.medium,
              fontFamily: FONT.Descriptoin_Regular,
              marginTop: 5,
            }}>
            {receiveError ? receiveError : ' '}
          </Text>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  qrcodeContainer: {
    width: '90%',
    maxWidth: 250,
    height: 250,
    ...CENTER,

    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },

  transactionStatusContainer: {
    width: 220,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...CENTER,
  },
  statusTitle: {
    fontSize: SIZES.large,
    fontFamily: FONT.Title_Bold,
  },
  statusText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Descriptoin_Regular,
  },
});
