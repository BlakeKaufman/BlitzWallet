import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {CENTER, SATSPERBITCOIN} from '../../../../../constants';
import CustomButton from '../../../../../functions/CustomElements/button';
import {assetIDS} from '../../../../../functions/liquidWallet/assetIDS';
import {InputTypeVariant} from '@breeztech/react-native-breez-sdk';
import {useState} from 'react';
import {getLNAddressForLiquidPayment} from '../functions/payments';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';

export default function AcceptButtonSendPage({
  canSendPayment,
  isCalculatingFees,
  decodeSendAddress,
  errorMessageNavigation,
  btcAdress,
  paymentInfo,
  convertedSendAmount,
  paymentDescription,
  //   setSendingAmount,
  setPaymentInfo,
  isSendingSwap,
}) {
  const {
    nodeInformation,
    liquidNodeInformation,
    masterInfoObject,
    minMaxLiquidSwapAmounts,
  } = useGlobalContextProvider();

  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const navigate = useNavigation();
  return (
    <CustomButton
      buttonStyles={{
        opacity:
          canSendPayment &&
          !isCalculatingFees &&
          !(isSendingSwap && paymentInfo?.data?.invoice?.amountMsat === null)
            ? 1
            : 0.5,
        width: 'auto',
        ...CENTER,
        marginTop: 15,
      }}
      textStyles={{
        includeFontPadding: false,
      }}
      useLoading={isGeneratingInvoice}
      actionFunction={handleEnterSendAmount}
      textContent={'Accept'}
    />
  );

  async function handleEnterSendAmount() {
    if (isCalculatingFees) {
      navigate.navigate('ErrorScreen', {errorMessage: 'Calculating fees'});
      return;
    }
    if (!paymentInfo?.sendAmount) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Please enter a send amount',
      });
      return;
    }
    if (isSendingSwap && paymentInfo?.data?.invoice?.amountMsat === null) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Cannot send to zero amount invoice from liquid',
      });
      return;
    }
    if (!canSendPayment && !!paymentInfo?.sendAmount) {
      navigate.navigate('ErrorScreen', {
        errorMessage:
          paymentInfo?.sendAmount < minMaxLiquidSwapAmounts.min ||
          paymentInfo?.sendAmount > minMaxLiquidSwapAmounts.max
            ? `${
                paymentInfo?.sendAmount < minMaxLiquidSwapAmounts.min
                  ? 'Minimum'
                  : 'Maximum'
              } send amount ${formatBalanceAmount(
                numberConverter(
                  minMaxLiquidSwapAmounts[
                    paymentInfo?.sendAmount < minMaxLiquidSwapAmounts.min
                      ? 'min'
                      : 'max'
                  ],
                  masterInfoObject.userBalanceDenomination,
                  nodeInformation,
                  masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
                ),
              )}`
            : 'Not enough funds to cover fees',
      });
      return;
    }
    if (!canSendPayment) return;
    setIsGeneratingInvoice(true);
    try {
      let invoice;

      if (paymentInfo?.type === InputTypeVariant.LN_URL_PAY) {
        invoice = await getLNAddressForLiquidPayment(
          paymentInfo,
          convertedSendAmount,
          paymentDescription,
        );
      } else if (paymentInfo?.type === 'liquid') {
        invoice = `${
          process.env.BOLTZ_ENVIRONMENT === 'testnet'
            ? 'liquidtestnet:'
            : 'liquidnetwork:'
        }${btcAdress}?amount=${(convertedSendAmount / SATSPERBITCOIN).toFixed(
          8,
        )}&assetid=${assetIDS['L-BTC']}`;
      } else {
        invoice = paymentInfo?.data.invoice?.bolt11;
      }

      decodeSendAddress({
        nodeInformation,
        btcAdress: invoice,
        goBackFunction: errorMessageNavigation,
        // setIsLightningPayment,
        // setSendingAmount,
        setPaymentInfo,
        // setIsLoading,
        liquidNodeInformation,
        masterInfoObject,
        navigate,
        maxZeroConf:
          minMaxLiquidSwapAmounts?.submarineSwapStats?.limits?.maximalZeroConf,
      });
    } catch (err) {
      console.log(err);
    }
  }
}