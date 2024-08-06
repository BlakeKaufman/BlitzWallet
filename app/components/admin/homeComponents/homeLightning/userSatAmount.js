import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {COLORS, FONT, SATSPERBITCOIN, SIZES} from '../../../../constants';

import {useGlobalContextProvider} from '../../../../../context-store/context';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import {ThemeText} from '../../../../functions/CustomElements';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';

export function UserSatAmount() {
  const {
    nodeInformation,
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
        <FormattedSatText
          iconHeight={25}
          iconWidth={25}
          styles={{...styles.valueText}}
          formattedBalance={formatBalanceAmount(
            numberConverter(
              nodeInformation.userBalance + liquidNodeInformation.userBalance,
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
            ),
          )}
        />
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
  },
  valueText: {
    fontSize: SIZES.xxLarge,
    marginHorizontal: 5,
  },
});
