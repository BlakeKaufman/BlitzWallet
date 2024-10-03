import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {BTN, COLORS, FONT, SATSPERBITCOIN, SIZES} from '../../../../constants';
import {useEffect, useState} from 'react';
import {deleteItem, terminateAccount} from '../../../../functions/secureStore';
import {removeLocalStorageItem} from '../../../../functions/localStorage';
import RNRestart from 'react-native-restart';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemeText} from '../../../../functions/CustomElements';
import CustomButton from '../../../../functions/CustomElements/button';
import GetThemeColors from '../../../../hooks/themeColors';
import {useNavigation} from '@react-navigation/native';
import Icon from '../../../../functions/CustomElements/Icon';

export default function ResetPage(props) {
  const [selectedOptions, setSelectedOptions] = useState({
    securedItems: false,
    localStoredItems: false,
  });
  const {
    theme,
    nodeInformation,
    masterInfoObject,
    liquidNodeInformation,
    darkModeType,
  } = useGlobalContextProvider();

  const {backgroundColor, backgroundOffset} = GetThemeColors();
  const navigate = useNavigation();

  return (
    <View style={{flex: 1, alignItems: 'center'}}>
      <View
        style={[
          styles.infoContainer,
          {
            marginTop: 30,
            backgroundColor: backgroundOffset,
          },
        ]}>
        <ThemeText
          styles={{
            ...styles.warningHeader,
            color:
              theme && darkModeType ? COLORS.darkModeText : COLORS.cancelRed,
          }}
          content={'Are you sure?'}
        />
      </View>
      <View
        style={[
          styles.infoContainer,
          {
            backgroundColor: backgroundOffset,
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
              onPress={() => handleSelectedItems('securedItems')}
              style={[
                styles.selectorDot,
                {
                  backgroundColor: selectedOptions.securedItems
                    ? theme
                      ? COLORS.darkModeText
                      : COLORS.lightModeText
                    : 'transparent',
                  borderWidth: selectedOptions.securedItems ? 0 : 2,
                  borderColor: theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              {selectedOptions.securedItems && (
                <Icon
                  width={15}
                  height={15}
                  color={theme ? COLORS.lightModeText : COLORS.darkModeText}
                  name={'expandedTxCheck'}
                />
              )}
            </TouchableOpacity>
            <ThemeText
              styles={{...styles.selectorText}}
              content={'Delete seed phrase and pin from my device'}
            />
          </View>
          <View style={styles.selectorContainer}>
            <TouchableOpacity
              onPress={() => handleSelectedItems('localStoredItems')}
              style={[
                styles.selectorDot,
                {
                  backgroundColor: selectedOptions.localStoredItems
                    ? theme
                      ? COLORS.darkModeText
                      : COLORS.lightModeText
                    : 'transparent',
                  borderWidth: selectedOptions.localStoredItems ? 0 : 2,
                  borderColor: theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              {selectedOptions.localStoredItems && (
                <Icon
                  width={15}
                  height={15}
                  color={theme ? COLORS.lightModeText : COLORS.darkModeText}
                  name={'expandedTxCheck'}
                />
              )}
            </TouchableOpacity>
            <ThemeText
              styles={{...styles.selectorText}}
              content={'Delete locally stored data from my device'}
            />
          </View>
          {/* <View style={styles.selectorContainer}>
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
          </View> */}
        </View>
      </View>
      <View
        style={[
          styles.infoContainer,
          {
            backgroundColor: backgroundOffset,
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

      <CustomButton
        buttonStyles={{
          opacity:
            selectedOptions.securedItems || selectedOptions.localStoredItems
              ? 1
              : 0.5,
          width: 'auto',
          marginTop: 'auto',
        }}
        actionFunction={resetWallet}
        textContent={'Reset'}
      />
    </View>
  );

  function handleSelectedItems(item) {
    setSelectedOptions(prev => {
      if (item === 'securedItems')
        return {...prev, securedItems: !prev.securedItems};
      else return {...prev, localStoredItems: !prev.localStoredItems};
    });
  }

  async function resetWallet() {
    if (!selectedOptions.localStoredItems && !selectedOptions.securedItems)
      return;

    try {
      if (selectedOptions.localStoredItems) {
        const didClearLocalStoreage = await clearLocalStorage();
        if (!didClearLocalStoreage)
          throw Error('Not able to delete local stored information');
      }
      if (selectedOptions.securedItems) {
        const didClearSecureItems = await terminateAccount();
        if (!didClearSecureItems)
          throw Error('Not able to delete secure stored information');
      }
      RNRestart.restart();
    } catch (err) {
      const errorMessage = err.message;
      console.log(errorMessage);
      navigate.navigate('ErrorScreen', {errorMessage: errorMessage});
    }
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
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  isSelectedDot: {
    backgroundColor: COLORS.primary,
  },
  selectorText: {
    width: '80%',
  },
});
