import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {COLORS, FONT, SATSPERBITCOIN, SIZES} from '../../../../constants';

import {useGlobalContextProvider} from '../../../../../context-store/context';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import {ThemeText} from '../../../../functions/CustomElements';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';
import {getEcashBalance} from '../../../../functions/eCash';
import {useGlobaleCash} from '../../../../../context-store/eCash';
import {useRef} from 'react';
import handleDBStateChange from '../../../../functions/handleDBStateChange';

export function UserSatAmount() {
  const {
    nodeInformation,
    masterInfoObject,
    toggleMasterInfoObject,
    liquidNodeInformation,
    setMasterInfoObject,
  } = useGlobalContextProvider();
  const {eCashBalance} = useGlobaleCash();
  const saveTimeoutRef = useRef(null);

  return (
    <TouchableOpacity
      onPress={() => {
        if (masterInfoObject.userBalanceDenomination === 'sats')
          handleDBStateChange(
            {userBalanceDenomination: 'fiat'},
            setMasterInfoObject,
            toggleMasterInfoObject,
            saveTimeoutRef,
          );
        else if (masterInfoObject.userBalanceDenomination === 'fiat')
          handleDBStateChange(
            {userBalanceDenomination: 'hidden'},
            setMasterInfoObject,
            toggleMasterInfoObject,
            saveTimeoutRef,
          );
        else
          handleDBStateChange(
            {userBalanceDenomination: 'sats'},
            setMasterInfoObject,
            toggleMasterInfoObject,
            saveTimeoutRef,
          );
      }}>
      <View style={styles.valueContainer}>
        <FormattedSatText
          iconHeight={25}
          iconWidth={25}
          styles={{...styles.valueText}}
          formattedBalance={formatBalanceAmount(
            numberConverter(
              nodeInformation.userBalance +
                liquidNodeInformation.userBalance +
                (masterInfoObject.enabledEcash ? eCashBalance : 0),
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
              masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
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
