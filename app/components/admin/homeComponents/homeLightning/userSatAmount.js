import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {COLORS, FONT, SATSPERBITCOIN, SIZES} from '../../../../constants';

import {useGlobalContextProvider} from '../../../../../context-store/context';
import {formatBalanceAmount, numberConverter} from '../../../../functions';

export function UserSatAmount(props) {
  const {
    nodeInformation,
    theme,
    masterInfoObject,
    toggleMasterInfoObject,
    liquidNodeInformation,
  } = useGlobalContextProvider();

  return (
    <TouchableOpacity
      onPress={() => {
        if (masterInfoObject.userBalanceDenomination === 'sats')
          toggleMasterInfoObject({userBalanceDenomination: 'fiat'});
        else if (masterInfoObject.userBalanceDenomination === 'fiat')
          toggleMasterInfoObject({userBalanceDenomination: 'hidden'});
        else toggleMasterInfoObject({userBalanceDenomination: 'sats'});
      }}>
      <View style={styles.valueContainer}>
        {/* <Text
          style={[
            styles.denominatorText,
            {
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              fontSize: SIZES.xxLarge,
            },
          ]}>
          {'\\U+20BF\\'}
        </Text> */}

        {masterInfoObject.userBalanceDenomination != 'hidden' ? (
          <>
            <Text
              style={[
                styles.valueText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              {formatBalanceAmount(
                numberConverter(
                  nodeInformation.userBalance +
                    liquidNodeInformation.userBalance,
                  masterInfoObject.userBalanceDenomination,
                  nodeInformation,
                ),
              )}
            </Text>
            <Text
              style={[
                styles.denominatorText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              {masterInfoObject.userBalanceDenomination === 'sats'
                ? 'sats'
                : nodeInformation.fiatStats.coin}
            </Text>
          </>
        ) : (
          <Text
            style={[
              styles.valueText,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            * * * * *
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  valueContainer: {
    width: '95%',
    maxWidth: 280,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 5,
  },

  denominatorText: {
    fontSize: SIZES.large,
    fontFamily: FONT.Title_Regular,
  },
  valueText: {
    fontSize: SIZES.xxLarge,
    fontFamily: FONT.Title_Regular,
    marginHorizontal: 5,
  },
});
