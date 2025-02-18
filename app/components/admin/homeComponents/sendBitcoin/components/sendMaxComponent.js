import {useState} from 'react';
import {CENTER, LIQUID_DEFAULT_FEE} from '../../../../../constants';
import {
  DUST_LIMIT_FOR_LBTC_CHAIN_PAYMENTS,
  SATSPERBITCOIN,
} from '../../../../../constants/math';
import CustomButton from '../../../../../functions/CustomElements/button';
import {InputTypeVariant} from '@breeztech/react-native-breez-sdk';
import {fetchOnchainLimits} from '@breeztech/react-native-breez-sdk-liquid';
import {calculateBoltzFeeNew} from '../../../../../functions/boltz/boltzFeeNew';

export default function SendMaxComponent({
  nodeInformation,
  liquidNodeInformation,
  eCashBalance,
  paymentInfo,
  navigate,
  setPaymentInfo,
  isLiquidPayment,
  isLightningPayment,
  isBitcoinPayment,
  minMaxLiquidSwapAmounts,
  masterInfoObject,
}) {
  const [isGettingMax, setIsGettingMax] = useState(false);
  return (
    <CustomButton
      buttonStyles={{
        width: 'auto',
        ...CENTER,
        marginBottom: 25,
      }}
      textStyles={{
        includeFontPadding: false,
      }}
      useLoading={isGettingMax}
      actionFunction={() => {
        sendMax();
      }}
      textContent={'Send Max'}
    />
  );
  async function sendMax() {
    try {
      setIsGettingMax(true);
      const currentLimits = await fetchOnchainLimits();

      const paymentType = paymentInfo.paymentNetwork?.toLowerCase();

      if (!paymentType) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Not able to get payment network type.',
        });
        return;
      }

      let maxAmountSats = 0;

      const balanceOptions = [
        {
          balance: liquidNodeInformation.userBalance,
          type: 'liquid',
        },
        {
          balance: masterInfoObject.liquidWalletSettings.isLightningEnabled
            ? Math.floor(nodeInformation.userBalance)
            : 0,
          type: 'lightning',
        },
        {
          balance: masterInfoObject.enabledEcash ? eCashBalance : 0,
          type: 'ecash',
        },
      ].sort((a, b) => b.balance - a.balance);
      console.log(balanceOptions, isLightningPayment);

      const validBalanceOptions = balanceOptions.filter(
        option => option.balance > 0,
      );

      if (validBalanceOptions.length === 0) {
        navigate.navigate('ErrorScreen', {
          errorMessage:
            'All your balances are too low to cover the required fees.',
        });
        return;
      }

      for (const option of validBalanceOptions) {
        if (option.type === 'liquid') {
          if (option.balance <= DUST_LIMIT_FOR_LBTC_CHAIN_PAYMENTS) continue;
          const swapFee =
            LIQUID_DEFAULT_FEE +
            calculateBoltzFeeNew(
              option.balance,
              'liquid-ln',
              minMaxLiquidSwapAmounts.submarineSwapStats,
            );
          console.log(swapFee, 'SWAP FEE');
          if (
            isLiquidPayment ||
            (isBitcoinPayment && option.balance >= currentLimits.send.minSat)
          ) {
            maxAmountSats = option.balance;
            break;
          } else if (
            paymentInfo.type === InputTypeVariant.LN_URL_PAY &&
            option.balance >= minMaxLiquidSwapAmounts.min + swapFee + 1
          ) {
            maxAmountSats = option.balance - swapFee - 1;
            break;
          } else {
            maxAmountSats = 0;
          }
        } else if (option.type === 'lightning') {
          if (!masterInfoObject.liquidWalletSettings.isLightningEnabled)
            continue;

          const lnFee = Math.round(option.balance * 0.0005) + 4;
          if (isLightningPayment) {
            maxAmountSats = option.balance - 5 - lnFee;
            break;
          } else if (
            isBitcoinPayment &&
            option.balance >= currentLimits.send.minSat + 5
          ) {
            maxAmountSats = option.balance - 5 - lnFee;
            break;
          } else if (
            isLiquidPayment &&
            option.balance >= minMaxLiquidSwapAmounts.min + 5
          ) {
            maxAmountSats = option.balance - 5 - lnFee;
            break;
          } else {
            maxAmountSats = 0;
          }
        } else if (option.type === 'ecash') {
          if (!masterInfoObject.enabledEcash) continue;
          if (isLightningPayment && option.balance) {
            maxAmountSats =
              Number(option.balance) - 2 < 0 ? 0 : Number(option.balance) - 2;
            break;
          } else maxAmountSats = 0;
        }
      }
      const convertedMax =
        masterInfoObject.userBalanceDenomination != 'fiat'
          ? Math.round(Number(maxAmountSats))
          : (
              Number(maxAmountSats) /
              Math.round(SATSPERBITCOIN / nodeInformation.fiatStats?.value)
            ).toFixed(3);

      if (maxAmountSats < 1) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'No max amounts are possible',
        });
        return;
      } else {
        setPaymentInfo(prev => ({
          ...prev,
          sendAmount: String(convertedMax),
        }));
      }
    } catch (err) {
      console.log(err, 'ERROR');
    } finally {
      setIsGettingMax(false);
    }
  }
}
