import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {ThemeText} from '../../../../../functions/CustomElements';
import {CENTER, COLORS, SIZES} from '../../../../../constants';
import {InputTypeVariant} from '@breeztech/react-native-breez-sdk';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import Icon from '../../../../../functions/CustomElements/Icon';
import {useGlobaleCash} from '../../../../../../context-store/eCash';

export default function UserTotalBalanceInfo({
  isBTCdenominated,
  initialSendingAmount,
  sendingAmount,
  paymentInfo,
  setIsAmountFocused,
}) {
  const {liquidNodeInformation, nodeInformation, masterInfoObject, theme} =
    useGlobalContextProvider();
  const {eCashBalance} = useGlobaleCash();

  return (
    <View style={styles.balanceInfoContainer}>
      <ThemeText styles={{...styles.headerText}} content={'Total Balance'} />
      <FormattedSatText
        containerStyles={{...CENTER, marginBottom: 10}}
        neverHideBalance={true}
        iconHeight={20}
        iconWidth={20}
        styles={{...styles.headerText, includeFontPadding: false}}
        formattedBalance={formatBalanceAmount(
          numberConverter(
            liquidNodeInformation.userBalance +
              nodeInformation.userBalance +
              (masterInfoObject.enabledEcash ? eCashBalance : 0),
            masterInfoObject.userBalanceDenomination,
            nodeInformation,
            masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
          ),
        )}
      />
      <ThemeText
        styles={{...styles.subHeaderText}}
        content={'Amount that will be sent:'}
      />
      {initialSendingAmount &&
      paymentInfo?.type != InputTypeVariant.LN_URL_PAY ? (
        <FormattedSatText
          containerStyles={{...CENTER}}
          neverHideBalance={true}
          iconHeight={20}
          iconWidth={20}
          styles={{...styles.headerText, includeFontPadding: false}}
          formattedBalance={formatBalanceAmount(
            numberConverter(
              initialSendingAmount / 1000,
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
              masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
            ),
          )}
        />
      ) : (
        <TouchableOpacity
          onPress={() => {
            setIsAmountFocused(true);
          }}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !sendingAmount ? 0.5 : 1,
            },
          ]}>
          {masterInfoObject.satDisplay === 'symbol' &&
            masterInfoObject.userBalanceDenomination === 'sats' && (
              <Icon
                color={theme ? COLORS.darkModeText : COLORS.lightModeText}
                width={25}
                height={25}
                name={'bitcoinB'}
              />
            )}
          <TextInput
            style={{
              ...styles.sendingAmtBTC,
              width: 'auto',
              maxWidth: '70%',
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              zIndex: -1,
              marginRight: 5,
              pointerEvents: 'none',
            }}
            value={
              initialSendingAmount === sendingAmount
                ? formatBalanceAmount(sendingAmount / 1000)
                : formatBalanceAmount(sendingAmount)
                ? formatBalanceAmount(sendingAmount)
                : 0
            }
            readOnly={true}
          />
          <ThemeText
            content={`${
              masterInfoObject.satDisplay === 'symbol' &&
              masterInfoObject.userBalanceDenomination === 'sats'
                ? ''
                : masterInfoObject.userBalanceDenomination === 'fiat'
                ? `${nodeInformation.fiatStats.coin}`
                : masterInfoObject.userBalanceDenomination === 'hidden'
                ? '* * * * *'
                : 'sats'
            }`}
            styles={{fontSize: SIZES.xLarge, includeFontPadding: false}}
          />
        </TouchableOpacity>
        // <TouchableOpacity
        //   onPress={() => setIsAmountFocused(true)}
        //   style={[
        //     styles.sendingAmountInputContainer,
        //     {alignItems: 'baseline'},
        //   ]}>
        //   <ThemeText
        //     styles={{...styles.sendingAmtBTC, includeFontPadding: false}}
        //     content={
        //       initialSendingAmount === sendingAmount
        //         ? sendingAmount / 1000
        //         : sendingAmount
        //         ? sendingAmount
        //         : '0'
        //     }
        //   />
        //   <ThemeText
        //     styles={{
        //       marginLeft: 10,
        //       fontSize: SIZES.xLarge,
        //       includeFontPadding: false,
        //     }}
        //     content={isBTCdenominated ? 'sats' : nodeInformation.fiatStats.coin}
        //   />
        // </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  balanceInfoContainer: {
    marginBottom: 50,
  },
  headerText: {
    fontSize: SIZES.xLarge,
    ...CENTER,
  },
  subHeaderText: {
    ...CENTER,
  },
  sendingAmountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'left',

    ...CENTER,
  },
  sendingAmtBTC: {
    fontSize: SIZES.huge,
    includeFontPadding: false,
  },
});
