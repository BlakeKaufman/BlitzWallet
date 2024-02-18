import {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {CannotSwapPage, EnterAmount, QrCodePage} from './liquidPagesComponents';
import {nodeInfo} from '@breeztech/react-native-breez-sdk';
import {CENTER, COLORS, SIZES} from '../../../../constants';
import {getSwapPairInformation} from '../../../../functions/LBTC';
import {useGlobalContextProvider} from '../../../../../context-store/context';

export default function LiquidPage(props) {
  const [liquidAmount, setLiquidAmount] = useState('2000');
  const [feeInfo, setFeeInfo] = useState({
    boltzFeePercent: 0,
    liquidFee: 0,
    hash: '',
    minAmount: 0,
    maxAmount: 0,
  });
  const {nodeInformation} = useGlobalContextProvider();

  const [processStage, setProcessStage] = useState({
    amount: true,
    qrCode: false,
  });

  const [canSwap, setCanSwap] = useState(false);
  const [swapErrorMessage, setSwapErrorMessage] = useState('');

  useEffect(() => {
    (async () => {
      if (nodeInformation.didConnectToNode) {
        try {
          const swapInfo = await getSwapPairInformation();
          if (!swapInfo) {
            setSwapErrorMessage('Not able to get swap information.');
            return;
          }
          setFeeInfo({
            boltzFeePercent: swapInfo.fees.percentageSwapIn / 100,
            liquidFee: swapInfo.fees.minerFees.baseAsset?.normal,
            hash: swapInfo.hash,
            minAmount: swapInfo.limits.minimal + 1000,
            maxAmount: swapInfo.limits.maximal,
          });
          setCanSwap(true);
        } catch (err) {
          setSwapErrorMessage('Not connected to node.');
        }
      } else {
        setSwapErrorMessage('Not connected to node.');
      }
    })();
  }, []);

  return (
    <View style={[styles.container]}>
      {/* CANNOT SWAP PAGE WHEN NOT CONNECTED TO NODE */}
      {!canSwap && (
        <View
          style={[
            styles.qrcodeContainer,
            {
              marginBottom: 'auto',
              marginVertical: 20,
              justifyContent: 'space-between',
            },
          ]}>
          <ActivityIndicator
            size="large"
            color={props.theme ? COLORS.darkModeText : COLORS.lightModeText}
            style={{
              marginTop: 'auto',
              marginBottom: 'auto',
              transform: [{translateY: 12}],
            }}
          />
          <Text
            style={{
              fontSize: SIZES.large,
              color: COLORS.cancelRed,
              textAlign: 'center',
            }}>
            {swapErrorMessage ? swapErrorMessage : ' '}
          </Text>
        </View>
      )}

      {canSwap && (
        <>
          {processStage.amount && (
            <EnterAmount
              setLiquidAmount={setLiquidAmount}
              liquidAmount={liquidAmount}
              setProcessStage={setProcessStage}
              feeInfo={feeInfo}
              theme={props.theme}
              setIsSwapCreated={props.setIsSwapCreated}
            />
          )}
          {processStage.qrCode && (
            <QrCodePage
              liquidAmount={liquidAmount}
              feeInfo={feeInfo}
              theme={props.theme}
              setGeneratedAddress={props.setGeneratedAddress}
              generatedAddress={props.generatedAddress}
              setGeneratingInvoiceQRCode={props.setGeneratingInvoiceQRCode}
              generatingInvoiceQRCode={props.generatingInvoiceQRCode}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  //
  qrcodeContainer: {
    width: '90%',
    maxWidth: 250,
    height: 250,
    ...CENTER,

    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
});
