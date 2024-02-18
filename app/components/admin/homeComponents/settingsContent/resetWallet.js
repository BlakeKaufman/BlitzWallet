import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {BTN, COLORS, FONT, SIZES} from '../../../../constants';
import {useEffect, useState} from 'react';
import {deleteItem} from '../../../../functions/secureStore';
import {removeLocalStorageItem} from '../../../../functions/localStorage';
import RNRestart from 'react-native-restart';
import {useGlobalContextProvider} from '../../../../../context-store/context';

export default function ResetPage() {
  const [selectedOptions, setSelectedOptions] = useState({
    seed: false,
    paymentHistory: false,
    pin: false,
  });
  const {theme, nodeInformation} = useGlobalContextProvider();

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
        <Text style={styles.warningHeader}>Are you sure?</Text>
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
        <Text
          style={[
            styles.infoTitle,
            {
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          Select data to delete from this device.
        </Text>
        <Text
          style={[
            styles.infoDescription,
            {
              marginBottom: 15,
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          Any option that is selected will be removed forever. If your seed is
          forgotten, you WILL lose your funds.
        </Text>
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
            <Text
              style={[
                styles.selectorText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Delete seed phrase from my device
            </Text>
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
            <Text
              style={[
                styles.selectorText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Delete payment history from my device
            </Text>
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
            <Text
              style={[
                styles.selectorText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Delete pin from my device
            </Text>
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
        <Text
          style={[
            styles.infoTitle,
            {
              textAlign: 'center',
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          Your balance is
        </Text>
        <Text
          style={[
            styles.infoDescription,
            {
              textAlign: 'center',
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          {Math.round(nodeInformation.userBalance).toLocaleString()} sats
        </Text>
      </View>
      <TouchableOpacity
        onPress={resetWallet}
        style={[
          BTN,
          {
            backgroundColor: COLORS.primary,
            marginTop: 'auto',
            marginBottom: 'auto',
            opacity:
              selectedOptions.paymentHistory ||
              selectedOptions.pin ||
              selectedOptions.seed
                ? 1
                : 0.4,
          },
        ]}>
        <Text
          style={{
            fontFamily: FONT.Other_Regular,
            color: COLORS.white,
            fontSize: SIZES.medium,
          }}>
          Reset Wallet
        </Text>
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
        paymentHistory = await removeLocalStorageItem('breezInfo');
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

const styles = StyleSheet.create({
  infoContainer: {
    width: '90%',
    backgroundColor: COLORS.offsetBackground,
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
  warningDescription: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    textAlign: 'center',
  },
  infoTitle: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.medium,
    marginBottom: 10,
  },
  infoDescription: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
  },
  borderView: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.black,
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
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
  },
});
