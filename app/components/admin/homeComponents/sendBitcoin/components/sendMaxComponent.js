import {useState} from 'react';
import {CENTER} from '../../../../../constants';
import {
  DUST_LIMIT_FOR_LBTC_CHAIN_PAYMENTS,
  SATSPERBITCOIN,
} from '../../../../../constants/math';
import CustomButton from '../../../../../functions/CustomElements/button';
import {InputTypeVariant, nodeInfo} from '@breeztech/react-native-breez-sdk';
import {
  fetchOnchainLimits,
  getInfo,
} from '@breeztech/react-native-breez-sdk-liquid';

export default function SendMaxComponent({
  nodeInformation,
  eCashBalance,
  paymentInfo,
  navigate,
  setPaymentInfo,
  isLiquidPayment,
  isLightningPayment,
  minMaxLiquidSwapAmounts,
  masterInfoObject,
  isBitcoinPayment,
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
      const lnNodeInfo = await nodeInfo();
      const liquidNodeInfo = await getInfo();
      const currentLimits = await fetchOnchainLimits();

      setIsGettingMax(true);
      const paymentType = paymentInfo.paymentNetwork?.toLowerCase();

      if (!paymentType) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Not able to get payment network type.',
        });
        return;
      }

      const canUseLiquid = isLiquidPayment
        ? liquidNodeInfo.balanceSat >= DUST_LIMIT_FOR_LBTC_CHAIN_PAYMENTS
        : isLightningPayment
        ? liquidNodeInfo.balanceSat >= minMaxLiquidSwapAmounts.min
        : liquidNodeInfo.balanceSat > currentLimits.send.minSat;
      const canUseLightning = isLiquidPayment
        ? lnNodeInfo.maxPayableMsat / 1000 >= minMaxLiquidSwapAmounts.min
        : isLightningPayment
        ? !!lnNodeInfo.maxPayableMsat / 1000
        : lnNodeInfo.maxPayableMsat / 1000 > currentLimits.send.minSat;
      const canUseEcash = isLiquidPayment
        ? false
        : isLightningPayment
        ? masterInfoObject.enabledEcash && !!eCashBalance
        : false;
      if (!canUseLightning && !canUseLiquid && !canUseEcash) {
        navigate.navigate('ErrorScreen', {
          errorMessage:
            'All your balances are too low to cover the required fees.',
        });
        return;
      }
      let maxAmountSats = 0;

      const balanceOptions = [
        {
          balance: liquidNodeInfo.balanceSat,
          type: 'liquid',
        },
        {
          balance: masterInfoObject.liquidWalletSettings.isLightningEnabled
            ? Math.floor(lnNodeInfo.maxPayableMsat / 1000)
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
        navigate.navigate('ErrorScreen', {errorMessage: 'You have no balance'});
        return;
      }

      for (const option of validBalanceOptions) {
        if (option.type === 'liquid') {
          if (option.balance <= DUST_LIMIT_FOR_LBTC_CHAIN_PAYMENTS) continue;
          if (
            isLiquidPayment ||
            (isBitcoinPayment && option.balance >= currentLimits.send.minSat)
          ) {
            maxAmountSats = option.balance;
            break;
          } else if (
            paymentInfo.type === InputTypeVariant.LN_URL_PAY &&
            option.balance >= minMaxLiquidSwapAmounts.min
          ) {
            maxAmountSats = option.balance;
            break;
          } else {
            maxAmountSats = 0;
          }
        } else if (option.type === 'lightning') {
          if (!masterInfoObject.liquidWalletSettings.enabledLightning) continue;
          if (isLightningPayment && !!option.balance) {
            maxAmountSats = option.balance - 10;
            break;
          } else if (
            isBitcoinPayment &&
            option.balance >= currentLimits.send.minSat
          ) {
            maxAmountSats = option.balance - 10;
            break;
          } else if (
            isLiquidPayment &&
            option.balance >= minMaxLiquidSwapAmounts.min
          ) {
            maxAmountSats = option.balance - 10;
            break;
          } else {
            maxAmountSats = 0;
          }
        } else if (option.type === 'ecash') {
          if (!masterInfoObject.enabledEcash) continue;
          if (isLightningPayment && !!option.balance) {
            maxAmountSats = Number(option.balance) - 2;
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
