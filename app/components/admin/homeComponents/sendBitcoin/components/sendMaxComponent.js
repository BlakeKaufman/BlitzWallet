import {useState} from 'react';
import {CENTER, LIQUID_DEFAULT_FEE} from '../../../../../constants';
import {
  LIGHTNINGAMOUNTBUFFER,
  LIQUIDAMOUTBUFFER,
  SATSPERBITCOIN,
} from '../../../../../constants/math';
import CustomButton from '../../../../../functions/CustomElements/button';

export default function SendMaxComponent({
  liquidNodeInformation,
  nodeInformation,
  eCashBalance,
  paymentInfo,
  navigate,
  setPaymentInfo,
  isLiquidPayment,
  isLightningPayment,
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
    setIsGettingMax(true);
    if (
      liquidNodeInformation.userBalance < 1000 &&
      nodeInformation.userBalance < 1000 &&
      paymentInfo.type === 'liquid' &&
      !(eCashBalance && paymentInfo.type === 'lightning')
    ) {
      navigate.navigate('ErrorScreen', {
        errorMessage:
          'All your balances are too low to cover the required fees.',
      });
      return;
    }
    try {
      let maxAmountSats = 0;

      const balanceOptions = [
        {
          balance: liquidNodeInformation.userBalance,
          isHighest:
            liquidNodeInformation.userBalance > nodeInformation.userBalance &&
            liquidNodeInformation.userBalance > eCashBalance,
          type: 'liquid',
        },
        {
          balance: nodeInformation.userBalance,
          isHighest:
            nodeInformation.userBalance > liquidNodeInformation.userBalance &&
            nodeInformation.userBalance > eCashBalance,
          type: 'lightning',
        },
        {
          balance: eCashBalance,
          isHighest:
            eCashBalance > nodeInformation.userBalance &&
            eCashBalance > liquidNodeInformation.userBalance,
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
          const predictedSendAmount = Number(
            option.balance - LIQUIDAMOUTBUFFER - LIQUID_DEFAULT_FEE,
          );
          if (predictedSendAmount < LIQUID_DEFAULT_FEE) continue;
          const liquidAwait = LIQUID_DEFAULT_FEE;

          if (
            option.balance > liquidAwait + LIQUIDAMOUTBUFFER &&
            option.balance >= 1000
          ) {
            if (isLiquidPayment) {
              maxAmountSats = option.balance - LIQUIDAMOUTBUFFER - liquidAwait;
              break;
            } else {
              const tempSendAmount =
                option.balance - liquidAwait - 50 - LIQUIDAMOUTBUFFER;
              if (tempSendAmount > minMaxLiquidSwapAmounts.min) {
                maxAmountSats = tempSendAmount;
                break;
              }
            }
          }
        } else if (option.type === 'lightning') {
          if (isLightningPayment) {
            maxAmountSats =
              option.balance - LIGHTNINGAMOUNTBUFFER - option.balance * 0.01;
            break;
          } else {
            const tempSendAmount =
              option.balance -
              option.balance * 0.01 -
              50 -
              LIGHTNINGAMOUNTBUFFER;
            if (tempSendAmount > minMaxLiquidSwapAmounts.min) {
              maxAmountSats = tempSendAmount;
              break;
            }
          }
        } else if (option.type === 'ecash') {
          if (isLightningPayment) {
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

      console.log(convertedMax, 'CONVERTED MAX');
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

      console.log('DID RUN');
      return;
    } catch (err) {
      console.log(err, 'ERROR');
    } finally {
      setIsGettingMax(false);
    }
  }
}
