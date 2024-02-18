import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {COLORS, FONT, SATSPERBITCOIN, SIZES} from '../../../../constants';

import {useGlobalContextProvider} from '../../../../../context-store/context';

export function UserSatAmount(props) {
  const {
    nodeInformation,
    theme,
    userBalanceDenomination,
    toggleUserBalanceDenomination,
  } = useGlobalContextProvider();

  console.log(userBalanceDenomination);

  return (
    <TouchableOpacity
      onPress={() => {
        if (userBalanceDenomination === 'sats')
          toggleUserBalanceDenomination('fiat');
        else if (userBalanceDenomination === 'fiat')
          toggleUserBalanceDenomination('hidden');
        else toggleUserBalanceDenomination('sats');
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

        {userBalanceDenomination != 'hidden' ? (
          <>
            <Text
              style={[
                styles.valueText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              {formatBitcoinAmoutn(
                Math.round(
                  userBalanceDenomination === 'sats'
                    ? nodeInformation.userBalance
                    : nodeInformation.userBalance *
                        (nodeInformation.fiatStats.value / SATSPERBITCOIN),
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
              {userBalanceDenomination === 'sats'
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

  function formatBitcoinAmoutn(amount) {
    if (!Number(amount)) {
      return '0';
    }

    let formattedAmt = amount
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      .replace(/,/g, ' ');

    return formattedAmt;

    const numbers = formattedAmt.split('').filter(num => !!(Number(num) + 5)); // this takes out the commus from messing up how many numbers I the user has

    const loopAmt = numbers.length >= 7 ? 11 : numbers.length >= 4 ? 10 : 9;

    if (numbers.length < 9) {
      for (let i = formattedAmt.length; i < loopAmt; i++) {
        formattedAmt = '0' + formattedAmt;
      }
    }

    const displayAmt = formattedAmt
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      .split('');

    if (numbers.length > 9) {
      displayAmt.splice(2, 0, '.');
    } else {
      displayAmt.splice(1, 0, '.');
    }

    const indexOfFirst = indexOfNum(displayAmt, 0);

    if (indexOfFirst === -1) return;
    if (indexOfFirst === 0) {
      const indexOfSecond = indexOfNum(displayAmt, 1);
      return formatText(displayAmt, indexOfSecond);
    } else {
      return formatText(displayAmt, indexOfFirst);
    }
  }

  function indexOfNum(array, chosenIndex) {
    let numberOfNums = 0;

    for (let i = 0; i < array.length; i++) {
      const num = array[i];

      if (!(Number(num) + 5)) continue;
      if (num >= 1 && num <= 9) {
        if (numberOfNums === chosenIndex) return i;
        else {
          numberOfNums += 1;
          continue;
        }
      }
    }
    return -1;
  }

  function formatText(displayAmt, index) {
    if (index === -1) {
      const splitDipsplay = displayAmt.splice(0).join('').split(',').join(' ');
      return <Text>{splitDipsplay}</Text>;
    }
    const splitDipsplay = displayAmt
      .splice(index)
      .join('')
      .split(',')
      .join(' ');
    const styledSplit = (
      <Text>
        {displayAmt.splice(0, index).join('').split(',').join('')}
        <Text style={styles.yourValue}>{splitDipsplay}</Text>
      </Text>
    );

    return styledSplit;
  }
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
