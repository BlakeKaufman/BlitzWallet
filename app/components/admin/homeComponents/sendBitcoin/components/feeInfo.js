import {StyleSheet, Text, View} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import {CENTER, SIZES} from '../../../../../constants';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';

export default function SendTransactionFeeInfo({
  canUseLiquid,
  canUseLightning,
  isLightningPayment,
  // fees,
  swapFee,
  liquidTxFee,
  canSendPayment,
  convertedSendAmount,
  sendingAmount,
  canUseEcash,
}) {
  const {masterInfoObject, nodeInformation, minMaxLiquidSwapAmounts} =
    useGlobalContextProvider();
  //options
  // LN -> LN which is: instant with 0 Blitz fee
  //LN -> Liquid which is: bank swap fee of
  //Liquid -> Liquid: liquid transaction fee of
  //LIquid -> LN: bank swap fee of

  if ((!canSendPayment && sendingAmount) || !sendingAmount) return;

  return (
    <View>
      <ThemeText
        styles={{...styles.headerText, marginTop: 30}}
        content={'Fee and Speed'}
      />
      {isLightningPayment ? (
        canUseLightning ? (
          <FormattedSatText
            frontText={'Instant with '}
            backText={' fee'}
            neverHideBalance={true}
            iconHeight={20}
            iconWidth={20}
            styles={{includeFontPadding: false}}
            formattedBalance={formatBalanceAmount(
              numberConverter(
                canUseEcash ? 5 : Math.round(convertedSendAmount * 0.01),
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
                0,
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
                masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
              ),
            )}
          />
        ) : (
          <FormattedSatText
            frontText={'Instant with '}
            backText={' fee'}
            neverHideBalance={true}
            iconHeight={20}
            iconWidth={20}
            styles={{includeFontPadding: false}}
            formattedBalance={formatBalanceAmount(
              numberConverter(
                swapFee + liquidTxFee,
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
                masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
              ),
            )}
          />
        )
      ) : canUseLiquid ? (
        <FormattedSatText
          frontText={'Instant with '}
          backText={' fee'}
          neverHideBalance={true}
          iconHeight={20}
          iconWidth={20}
          styles={{includeFontPadding: false}}
          formattedBalance={formatBalanceAmount(
            numberConverter(
              liquidTxFee,
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
              masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
            ),
          )}
        />
      ) : (
        <FormattedSatText
          frontText={`Fee: `}
          neverHideBalance={true}
          iconHeight={20}
          iconWidth={20}
          styles={{includeFontPadding: false}}
          formattedBalance={formatBalanceAmount(
            numberConverter(
              swapFee,
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
              masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
            ),
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: SIZES.large,

    ...CENTER,
  },
  subHeaderText: {
    ...CENTER,
  },
});
