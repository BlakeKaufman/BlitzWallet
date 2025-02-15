import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {COLORS, FONT, SATSPERBITCOIN, SIZES} from '../../../../constants';
import {useState} from 'react';
import {deleteItem, terminateAccount} from '../../../../functions/secureStore';
import RNRestart from 'react-native-restart';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemeText} from '../../../../functions/CustomElements';
import CustomButton from '../../../../functions/CustomElements/button';
import GetThemeColors from '../../../../hooks/themeColors';
import {useNavigation} from '@react-navigation/native';
import Icon from '../../../../functions/CustomElements/Icon';
import {deleteTable} from '../../../../functions/messaging/cachedMessages';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';
import auth from '@react-native-firebase/auth';

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

  const {backgroundOffset} = GetThemeColors();
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
        <FormattedSatText
          styles={{fontSize: SIZES.large}}
          neverHideBalance={true}
          formattedBalance={formatBalanceAmount(
            numberConverter(
              nodeInformation.userBalance + liquidNodeInformation.userBalance,
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
              masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
            ),
          )}
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
        await deleteTable();
        if (!didClearLocalStoreage)
          throw Error('Not able to delete local stored information');
      }
      if (selectedOptions.securedItems) {
        const didClearSecureItems = await terminateAccount();
        if (!didClearSecureItems)
          throw Error('Not able to delete secure stored information');
      }
      try {
        await auth().signOut();
      } catch (err) {
        console.log('reset wallet sign out error', err);
      }

      RNRestart.restart();
    } catch (err) {
      const errorMessage = err.message;
      console.log(errorMessage);
      navigate.navigate('ErrorScreen', {errorMessage: errorMessage});
    }
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
    fontSize: SIZES.large,
    color: COLORS.cancelRed,
    fontWeight: '500',
    textAlign: 'center',
  },

  infoTitle: {
    fontWeight: '500',
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
    marginRight: 10,
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
