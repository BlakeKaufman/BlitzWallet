import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {ThemeText} from '../../../../../functions/CustomElements';
import {CENTER, COLORS, SIZES} from '../../../../../constants';
import {InputTypeVariant} from '@breeztech/react-native-breez-sdk';

export default function UserTotalBalanceInfo({
  isBTCdenominated,
  initialSendingAmount,
  sendingAmount,
  paymentInfo,
  setIsAmountFocused,
}) {
  const {liquidNodeInformation, nodeInformation, masterInfoObject, theme} =
    useGlobalContextProvider();

  return (
    <View style={styles.balanceInfoContainer}>
      <ThemeText styles={{...styles.headerText}} content={'Total Balance'} />
      <ThemeText
        styles={{...styles.headerText}}
        content={`${formatBalanceAmount(
          numberConverter(
            liquidNodeInformation.userBalance + nodeInformation.userBalance,
            masterInfoObject.userBalanceDenomination,
            nodeInformation,
            masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
          ),
        )} ${isBTCdenominated ? 'sats' : nodeInformation.fiatStats.coin}`}
      />
      <ThemeText
        styles={{...styles.subHeaderText}}
        content={'Amount that will be sent:'}
      />
      {initialSendingAmount &&
      paymentInfo?.type != InputTypeVariant.LN_URL_PAY ? (
        <ThemeText
          styles={{...styles.sendingAmtBTC, ...CENTER}}
          content={`${formatBalanceAmount(
            numberConverter(
              initialSendingAmount / 1000,
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
              masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
            ),
          )} ${isBTCdenominated ? 'sats' : nodeInformation.fiatStats.coin}`}
        />
      ) : (
        <TouchableOpacity
          onPress={() => setIsAmountFocused(true)}
          style={[
            styles.sendingAmountInputContainer,
            {alignItems: 'baseline'},
          ]}>
          <ThemeText
            styles={{...styles.sendingAmtBTC, includeFontPadding: false}}
            content={sendingAmount ? sendingAmount : '0'}
          />
          {/* <TextInput
            style={[
              styles.sendingAmtBTC,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                maxWidth: 175,
                margin: 0,
                padding: 0,
              },
            ]}
            placeholderTextColor={
              theme ? COLORS.darkModeText : COLORS.lightModeText
            }
            value={
              sendingAmount === null || sendingAmount === 0
                ? ''
                : String(sendingAmount / 1000)
            }
            keyboardType="number-pad"
            placeholder="0"
            onChangeText={e => {
              if (isNaN(e)) return;
              setSendingAmount(Number(e) * 1000);
            }}
          /> */}
          <ThemeText
            styles={{
              marginLeft: 10,
              fontSize: SIZES.xLarge,
              includeFontPadding: false,
            }}
            content={isBTCdenominated ? 'sats' : nodeInformation.fiatStats.coin}
          />
        </TouchableOpacity>
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
