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
}) {
  console.log(swapFee, 'TEST');
  const {masterInfoObject, nodeInformation, minMaxLiquidSwapAmounts} =
    useGlobalContextProvider();
  //options
  // LN -> LN which is: instant with 0 Blitz fee
  //LN -> Liquid which is: bank swap fee of
  //Liquid -> Liquid: liquid transaction fee of
  //LIquid -> LN: bank swap fee of
  return (
    <View>
      <ThemeText
        styles={{...styles.headerText, marginTop: 30}}
        content={'Fee and Speed'}
      />
      {isLightningPayment ? (
        canUseLightning ? (
          <ThemeText
            styles={{...styles.subHeaderText}}
            content={'Instant with 0 Blitz fee'}
          />
        ) : (
          <FormattedSatText
            frontText={'Instant and '}
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
          // <ThemeText
          //   styles={{...styles.subHeaderText}}
          //   content={`Swap fee of ${formatBalanceAmount(
          //     numberConverter(
          //       swapFee + liquidTxFee,
          //       masterInfoObject.userBalanceDenomination,
          //       nodeInformation,
          //       masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
          //     ),
          //   )} ${
          //     masterInfoObject.userBalanceDenomination != 'fiat'
          //       ? 'sats'
          //       : nodeInformation.fiatStats.coin
          //   }`}
          // />
        )
      ) : canUseLiquid ? (
        <>
          {canSendPayment && convertedSendAmount >= 1000 ? (
            <FormattedSatText
              frontText={'Instant and '}
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
            <Text> </Text>
          )}
        </>
      ) : // <ThemeText
      //   styles={{...styles.subHeaderText}}
      //   content={
      //     canSendPayment && convertedSendAmount >= 1000
      //       ? `Liquid transaction fee of ${formatBalanceAmount(
      //           numberConverter(
      //             liquidTxFee,
      //             masterInfoObject.userBalanceDenomination,
      //             nodeInformation,
      //             masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
      //           ),
      //         )} ${
      //           masterInfoObject.userBalanceDenomination != 'fiat'
      //             ? 'sats'
      //             : nodeInformation.fiatStats.coin
      //         }`
      //       : ''
      //   }
      // />
      canUseLightning ? (
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
      ) : (
        // <ThemeText
        //   styles={{...styles.subHeaderText}}
        //   content={`Swap fee of ${formatBalanceAmount(
        //     numberConverter(
        //       swapFee,
        //       masterInfoObject.userBalanceDenomination,
        //       nodeInformation,
        //       masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
        //     ),
        //   )} ${
        //     masterInfoObject.userBalanceDenomination != 'fiat'
        //       ? 'sats'
        //       : nodeInformation.fiatStats.coin
        //   }`}
        // />
        ''
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
