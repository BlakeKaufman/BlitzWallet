import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import {CENTER, ICONS, SIZES} from '../../../../../constants';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import {useNavigation} from '@react-navigation/native';
import {useNodeContext} from '../../../../../../context-store/nodeContext';

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
  lightningFee,
  canUseEcash,
  isSendingSwap,
  isReverseSwap,
  isSubmarineSwap,
  isLiquidPayment,
  paymentInfo,
}) {
  const {masterInfoObject} = useGlobalContextProvider();
  const {nodeInformation, liquidNodeInformation} = useNodeContext();
  const navigate = useNavigation();
  console.log('ISREVERSE', isReverseSwap);
  console.log('ISSUB', isSubmarineSwap);
  console.log('LNFEE', lightningFee);
  console.log('ISLNPAY', isLightningPayment);
  console.log(lightningFee == null && (isLightningPayment || isReverseSwap));
  //options
  // LN -> LN which is: instant with 0 Blitz fee
  //LN -> Liquid which is: bank swap fee of
  //Liquid -> Liquid: liquid transaction fee of
  //LIquid -> LN: bank swap fee of

  // if ((!canSendPayment && sendingAmount) || !sendingAmount) return;
  console.log(swapFee);
  return (
    <View>
      <TouchableOpacity
        activeOpacity={
          lightningFee == null &&
          ((isLightningPayment && canUseLightning) || isReverseSwap)
            ? 0.2
            : 1
        }
        onPress={() => {
          if (
            !(
              lightningFee == null &&
              ((isLightningPayment && canUseLightning) || isReverseSwap)
            )
          )
            return;
          navigate.navigate('InformationPopup', {
            textContent:
              'Since trampoline payments are off, the network fees may vary based on the path your payment takes.',
            buttonText: 'I understand',
          });
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 10,
        }}>
        <ThemeText styles={styles.headerText} content={'Fee and Speed'} />
        {lightningFee == null &&
          ((isLightningPayment && canUseLightning) || isReverseSwap) && (
            <ThemeImage
              styles={{width: 20, height: 20, marginLeft: 5}}
              lightModeIcon={ICONS.aboutIcon}
              darkModeIcon={ICONS.aboutIcon}
              lightsOutIcon={ICONS.aboutIconWhite}
            />
          )}
      </TouchableOpacity>
      {isLightningPayment ? (
        canUseLightning ? (
          <>
            {lightningFee === null ? (
              <ThemeText styles={{...CENTER}} content={'Variable & instant'} />
            ) : (
              <FormattedSatText
                backText={` & instant`}
                neverHideBalance={true}
                styles={{includeFontPadding: false}}
                formattedBalance={formatBalanceAmount(
                  numberConverter(
                    canUseEcash ? 5 : lightningFee,
                    masterInfoObject.userBalanceDenomination,
                    nodeInformation,
                    0,
                    masterInfoObject.userBalanceDenomination,
                    nodeInformation,
                    masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
                  ),
                )}
              />
            )}
          </>
        ) : (
          <FormattedSatText
            backText={' & instant'}
            neverHideBalance={true}
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
      ) : isLiquidPayment ? (
        canUseLiquid ? (
          <FormattedSatText
            backText={' & instant'}
            neverHideBalance={true}
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
            backText={`${
              lightningFee == null &&
              ((isLightningPayment && canUseLightning) || isReverseSwap)
                ? ' + variable'
                : ''
            } & instant`}
            neverHideBalance={true}
            styles={{includeFontPadding: false}}
            formattedBalance={formatBalanceAmount(
              numberConverter(
                swapFee +
                  (lightningFee == null && (isLightningPayment || isReverseSwap)
                    ? 0
                    : lightningFee),
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
                masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
              ),
            )}
          />
        )
      ) : paymentInfo?.data.fee ? (
        <FormattedSatText
          backText={` & 10 minutes`}
          neverHideBalance={true}
          styles={{includeFontPadding: false}}
          formattedBalance={formatBalanceAmount(
            numberConverter(
              paymentInfo?.data.fee || 0,
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
              masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
            ),
          )}
        />
      ) : (
        <ThemeText content={''} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: SIZES.xLarge,
    fontWeight: 400,
    ...CENTER,
  },
  subHeaderText: {
    ...CENTER,
  },
});
