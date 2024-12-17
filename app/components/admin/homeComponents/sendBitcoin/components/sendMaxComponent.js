import {useState} from 'react';
import {CENTER} from '../../../../../constants';
import {
  LIGHTNINGAMOUNTBUFFER,
  LIQUIDAMOUTBUFFER,
} from '../../../../../constants/math';
import CustomButton from '../../../../../functions/CustomElements/button';
import {getLiquidTxFee} from '../../../../../functions/liquidWallet';

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
      //   useLoading={isLoading}
      actionFunction={() => {
        sendMax();
      }}
      textContent={'Send Max'}
    />
  );
  async function sendMax() {
    setIsGettingMax(true);
    if (
      !(liquidNodeInformation.userBalance > 1000) &&
      !(
        (nodeInformation.userBalance > 1000 && paymentInfo.type === 'liquid') ||
        (nodeInformation.userBalance && paymentInfo.type === 'lightning')
      ) &&
      !(eCashBalance && paymentInfo.type === 'lightning')
    ) {
      navigate.navigate('ErrorScreen', {
        errorMessage:
          'All your balances are too low to cover the required fees.',
      });
    }
    try {
      let maxAmountSats = 0;
      let chosenPaymentNetwork;
      const isLightningBalanceHighest =
        nodeInformation.userBalance > liquidNodeInformation.userBalance &&
        nodeInformation.userBalance > eCashBalance;
      const isLiquidBalanceHighest =
        liquidNodeInformation.userBalance > nodeInformation.userBalance &&
        liquidNodeInformation.userBalance > eCashBalance;
      const isEcashBalanceHighest =
        eCashBalance > nodeInformation.userBalance &&
        eCashBalance > liquidNodeInformation.userBalance;

      // const liquidTXFee = getLiquidTxFee({
      //   amountSat:
      //     liquidNodeInformation.userBalanceDenomination - LIQUIDAMOUTBUFFER,
      // });
      if (
        !isLightningBalanceHighest &&
        !isLiquidBalanceHighest &&
        !isEcashBalanceHighest
      ) {
        navigate.navigate('ErrorScreen', {errorMessage: 'You have no balance'});
        return;
      }

      let didFindSutableMax = false;
      let controledLoopCount = 0;
      let triedOptions = {
        didTryLiquid: false,
        didTryLightning: false,
        didTryEcash: false,
      };

      while (!didFindSutableMax && controledLoopCount < 50) {
        if (isLiquidBalanceHighest && !triedOptions.didTryLiquid) {
          const liquidAwait =
            (await getLiquidTxFee({
              amountSat: Number(
                liquidNodeInformation.userBalance - LIQUIDAMOUTBUFFER - 250,
              ),
            })) || 275;
          console.log(liquidAwait);
          if (
            liquidNodeInformation.userBalance >
            liquidAwait + LIQUIDAMOUTBUFFER
          ) {
            if (isLiquidPayment) {
              maxAmountSats =
                liquidNodeInformation.userBalance -
                LIQUIDAMOUTBUFFER -
                liquidAwait;
              didFindSutableMax = true;
            } else {
              const tempSendAmount =
                liquidNodeInformation.userBalance -
                liquidAwait -
                50 -
                LIQUIDAMOUTBUFFER;
              if (tempSendAmount > minMaxLiquidSwapAmounts.min) {
                maxAmountSats = tempSendAmount;
                didFindSutableMax = true;
              }
            }
          }
          triedOptions = {...triedOptions, didTryLiquid: true};
        } else if (isLightningBalanceHighest && !triedOptions.didTryLightning) {
          if (isLightningPayment) {
            maxAmountSats =
              nodeInformation.userBalance -
              LIGHTNINGAMOUNTBUFFER -
              nodeInformation.userBalance * 0.01;
            didFindSutableMax = true;
          } else {
            const tempSendAmount =
              nodeInformation.userBalance -
              nodeInformation.userBalance * 0.01 -
              swapFee -
              LIGHTNINGAMOUNTBUFFER;
            if (tempSendAmount > minMaxLiquidSwapAmounts.min) {
              maxAmountSats = tempSendAmount;
              didFindSutableMax = true;
            }
          }
          triedOptions = {...triedOptions, didTryLightning: true};
        } else if (isEcashBalanceHighest && !triedOptions.didTryEcash) {
          if (isLightningPayment) {
            maxAmountSats = eCashBalance - 5;
            didFindSutableMax = true;
          } else {
            didFindSutableMax = true; //will have to update if I add the ability to have custom ecash balance
          }
          triedOptions = {...triedOptions, didTryEcash: true};
        } else {
          didFindSutableMax = true;
        }
        controledLoopCount += 1;
      }

      if (maxAmountSats <= 0) {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'No max amounts are posible',
        });
        return;
      } else {
        setPaymentInfo(prev => {
          return {...prev, sendAmount: String(maxAmountSats)};
        });
      }

      console.log('DID RUN');
      return;

      if (isLiquidBalanceHighest) {
        const liquidTXFee = getLiquidTxFee({
          amountSat:
            liquidNodeInformation.userBalanceDenomination - LIQUIDAMOUTBUFFER,
        });
        if (isLiquidPayment)
          maxAmountSats =
            liquidNodeInformation.userBalance - liquidTxFee + LIQUIDAMOUTBUFFER;
        else
          maxAmountSats =
            liquidNodeInformation.userBalance -
            liquidTxFee +
            swapFee +
            LIQUIDAMOUTBUFFER;
      }
      if (isLightningPayment) {
        if (
          isLiquidBalanceHighest &&
          !(
            liquidNodeInformation.userBalance -
              liquidTxFee -
              LIGHTNINGAMOUNTBUFFER -
              calculateBoltzFeeNew(
                Number(liquidNodeInformation.userBalance),
                'liquid-ln',
                minMaxLiquidSwapAmounts['submarineSwapStats'],
              ) <
            minMaxLiquidSwapAmounts.min
          )
        ) {
          const liquidTXFee = getLiquidTxFee({
            amountSat:
              liquidNodeInformation.userBalanceDenomination - LIQUIDAMOUTBUFFER,
          });
          maxAmountSats =
            liquidNodeInformation.userBalance -
            liquidTXFee -
            swapFee -
            LIQUIDAMOUTBUFFER;
        } else {
          maxAmountSats = isLightningBalanceHighest
            ? nodeInformation.userBalance
            : eCashBalance;
        }
      } else {
      }

      // if (isLightningPayment && !nodeInformation.userBalance) {
      //   maxAmountSats = eCashBalance - 2;
      //   chosenPaymentNetwork = 'lightning';
      // } else {
      //   maxAmountSats = maxAmountSats = hasHigherLightningBalance
      //     ? nodeInformation.userBalance
      //     : liquidNodeInformation.userBalance;
      //   chosenPaymentNetwork = hasHigherLightningBalance
      //     ? 'lightning'
      //     : 'liquid';
      // }
    } catch (err) {
      console.log(err, 'ERROR');
    } finally {
      setIsGettingMax(false);
    }
  }
}
