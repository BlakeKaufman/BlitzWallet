import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {BTN, COLORS, FONT, SATSPERBITCOIN, SIZES} from '../../../../constants';
import {useEffect, useState} from 'react';
import {deleteItem} from '../../../../functions/secureStore';
import {removeLocalStorageItem} from '../../../../functions/localStorage';
import RNRestart from 'react-native-restart';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemeText} from '../../../../functions/CustomElements';

export default function ResetPage() {
  const [selectedOptions, setSelectedOptions] = useState({
    seed: false,
    paymentHistory: false,
    pin: false,
  });
  const {theme, nodeInformation, masterInfoObject, liquidNodeInformation} =
    useGlobalContextProvider();

  return (
    <View style={{flex: 1, alignItems: 'center'}}>
      <View
        style={[
          styles.infoContainer,
          {
            marginTop: 30,
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
          },
        ]}>
        <ThemeText
          styles={{...styles.warningHeader}}
          content={'Are you sure?'}
        />
      </View>
      <View
        style={[
          styles.infoContainer,
          {
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
          },
        ]}>
        <ThemeText
          styles={{...styles.infoTitle}}
          content={'Select data to delete from this device.'}
        />
        <ThemeText
          styles={{marginBottom: 15}}
          content={
            'Any option that is selected will be removed forever. If your seed is forgotten, you WILL lose your funds.'
          }
        />

        <View
          style={[
            styles.borderView,
            {
              backgroundColor: theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}></View>
        <View style={{marginTop: 15}}>
          <View style={styles.selectorContainer}>
            <TouchableOpacity
              onPress={() => handleSelectedItems('seed')}
              style={[
                styles.selectorDot,
                selectedOptions.seed && styles.isSelectedDot,
                {
                  borderColor: theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}></TouchableOpacity>
            <ThemeText
              styles={{...styles.selectorText}}
              content={'Delete seed phrase from my device'}
            />
          </View>
          <View style={styles.selectorContainer}>
            <TouchableOpacity
              onPress={() => handleSelectedItems('paymentHistory')}
              style={[
                styles.selectorDot,
                selectedOptions.paymentHistory && styles.isSelectedDot,
                {
                  borderColor: theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}></TouchableOpacity>
            <ThemeText
              styles={{...styles.selectorText}}
              content={'Delete locally stored data from my device'}
            />
          </View>
          <View style={styles.selectorContainer}>
            <TouchableOpacity
              onPress={() => handleSelectedItems('pin')}
              style={[
                styles.selectorDot,
                selectedOptions.pin && styles.isSelectedDot,
                {
                  borderColor: theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}></TouchableOpacity>
            <ThemeText
              styles={{...styles.selectorText}}
              content={'Delete pin from my device'}
            />
          </View>
        </View>
      </View>
      <View
        style={[
          styles.infoContainer,
          {
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
          },
        ]}>
        <ThemeText
          styles={{...styles.infoTitle, textAlign: 'center'}}
          content={'Your balance is'}
        />

        <ThemeText
          styles={{textAlign: 'center'}}
          content={`${formatBalanceAmount(
            numberConverter(
              masterInfoObject.userBalanceDenomination === 'fiat'
                ? (nodeInformation.userBalance +
                    liquidNodeInformation.userBalance) *
                    (nodeInformation.fiatStats.value / SATSPERBITCOIN)
                : nodeInformation.userBalance +
                    liquidNodeInformation.userBalance,
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
              masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
            ),
          )}  ${
            masterInfoObject.userBalanceDenomination === 'fiat'
              ? nodeInformation.fiatStats.coin
              : 'Sats'
          }`}
        />
      </View>
      <TouchableOpacity
        onPress={resetWallet}
        style={[
          BTN,
          {
            backgroundColor: COLORS.primary,
            marginTop: 'auto',
            // marginBottom: 'auto',
            opacity:
              selectedOptions.paymentHistory ||
              selectedOptions.pin ||
              selectedOptions.seed
                ? 1
                : 0.4,
          },
        ]}>
        <ThemeText styles={{color: COLORS.white}} content={'Reset Wallet'} />
      </TouchableOpacity>
    </View>
  );

  function handleSelectedItems(item) {
    setSelectedOptions(prev => {
      if (item === 'seed') return {...prev, seed: !prev.seed};
      else if (item === 'paymentHistory')
        return {...prev, paymentHistory: !prev.paymentHistory};
      else return {...prev, pin: !prev.pin};
    });
  }

  async function resetWallet() {
    if (
      !selectedOptions.paymentHistory &&
      !selectedOptions.pin &&
      !selectedOptions.seed
    )
      return;
    try {
      let paymentHistory = false;
      let pin = false;
      let seed = false;
      if (selectedOptions.paymentHistory)
        paymentHistory = await clearLocalStorage();
      if (selectedOptions.pin) pin = await deleteItem('pin');
      if (selectedOptions.seed) seed = await deleteItem('mnemonic');
      if (
        selectedOptions.paymentHistory === paymentHistory &&
        selectedOptions.pin === pin &&
        selectedOptions.seed === seed
      ) {
        RNRestart.restart();
      }
    } catch (err) {
      console.log(err);
    }
    console.log('RESET');
  }
}

async function clearLocalStorage() {
  try {
    (await AsyncStorage.getAllKeys()).forEach(key => {
      AsyncStorage.removeItem(key);
    });
    return true;
  } catch (err) {
    return false;
  }
}
const styles = StyleSheet.create({
  infoContainer: {
    width: '100%',
    padding: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningHeader: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.large,
    color: COLORS.cancelRed,

    textAlign: 'center',
  },

  infoTitle: {
    fontFamily: FONT.Title_Bold,

    marginBottom: 10,
  },
  borderView: {
    width: '100%',
    height: 1,
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  selectorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    marginRight: 20,
  },
  isSelectedDot: {
    backgroundColor: COLORS.primary,
  },
  selectorText: {
    width: '80%',
  },
});
