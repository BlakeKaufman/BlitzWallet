import {StyleSheet, View, Alert, Platform} from 'react-native';
import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SATSPERBITCOIN,
  SHADOWS,
  SIZES,
} from '../../../../constants';

import {useEffect, useRef, useState} from 'react';
import {
  InputTypeVariant,
  LnUrlCallbackStatusVariant,
  lnurlAuth,
  parseInput,
} from '@breeztech/react-native-breez-sdk';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';

import {
  getLiquidFees,
  sendLiquidTransaction,
} from '../../../../functions/liquidWallet';
import {calculateBoltzFee} from '../../../../functions/boltz/calculateBoltzFee';

import {decodeLiquidAddress} from '../../../../functions/liquidWallet/decodeLiquidAddress';
import LiquidPaymentScreen from './screens/liquidScreen';
import {assetIDS} from '../../../../functions/liquidWallet/assetIDS';
import LightningPaymentScreen from './screens/lightningScreen';

export default function SendPaymentScreen(props) {
  console.log('CONFIRM SEND PAYMENT SCREEN');
  const [paymentInfo, setPaymentInfo] = useState({});

  const [sendingAmount, setSendingAmount] = useState(null);

  const {
    theme,
    nodeInformation,
    masterInfoObject,
    liquidNodeInformation,
    toggleMasterInfoObject,
    contactsPrivateKey,
  } = useGlobalContextProvider();

  const navigate = useNavigation();
  const BTCadress = props.route.params?.btcAdress;

  const isBTCdenominated =
    masterInfoObject.userBalanceDenomination === 'hidden' ||
    masterInfoObject.userBalanceDenomination === 'sats';
  const fiatSatValue = nodeInformation.fiatStats.value / SATSPERBITCOIN;

  const isUsingBank =
    masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize &&
    nodeInformation.userBalance * 1000 - 5000 < sendingAmount &&
    liquidNodeInformation.userBalance * 1000 - 5000 > sendingAmount;

  useEffect(() => {
    verifyAddressType();
  }, []);

  return (
    <View
      style={[
        styles.popupContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          paddingTop: Platform.OS === 'ios' ? 0 : 10,
        },
      ]}>
      {paymentInfo.type === 'liquid' && (
        <LiquidPaymentScreen
          paymentInfo={paymentInfo}
          initialSendingAmount={sendingAmount}
          isUsingBank={isUsingBank}
          isBTCdenominated={isBTCdenominated}
          fiatSatValue={fiatSatValue}
        />
      )}
      {paymentInfo.type != 'liquid' && (
        <LightningPaymentScreen
          paymentInfo={paymentInfo}
          initialSendingAmount={sendingAmount}
          isBTCdenominated={isBTCdenominated}
          fiatSatValue={fiatSatValue}
        />
      )}
    </View>
  );

  async function verifyAddressType() {
    try {
      if (nodeInformation.didConnectToNode) {
        try {
          const input = await parseInput(BTCadress);

          console.log(input);
          setupLNPage(input);
        } catch (err) {
          const btcAddress = BTCadress.startsWith('liquidtestnet:')
            ? BTCadress.split('?')[0].split(':')[1]
            : BTCadress;

          const input = decodeLiquidAddress(btcAddress);

          if (input) setupLiquidPage(BTCadress);
          else
            Alert.alert(
              'Not a valid Address',
              'Please try again with a different address',
              [{text: 'Ok', onPress: () => goBackFunction()}],
            );

          // console.log(err);
        }
      } else {
        Alert.alert('Error not connected to node', '', [
          {text: 'Ok', onPress: () => goBackFunction()},
        ]);
      }
    } catch (err) {
      Alert.alert('Something went wrong when reading address', '', [
        {text: 'Ok', onPress: () => goBackFunction()},
      ]);
      console.log(err);
    }
  }

  async function setupLiquidPage(test) {
    const isBip21 = test.startsWith('liquidtestnet:');
    let addressInfo = {};

    if (isBip21) {
      const [address, paymentInfo] = test.split('?');

      const parsedAddress = address.split(':')[1];

      paymentInfo.split('&').forEach(data => {
        const [label, information] = data.split('=');
        if (label === 'amount') {
          addressInfo[label] = information * SATSPERBITCOIN * 1000;
          return;
        } else if (label === 'label') {
          addressInfo[label] = decodeURIComponent(information);
          return;
        }

        addressInfo[label] = information;
      });

      addressInfo['isBip21'] = true;
      addressInfo['address'] = parsedAddress;
    } else {
      addressInfo['address'] = BTCadress;
      addressInfo['amount'] = null;
      addressInfo['label'] = null;
      addressInfo['isBip21'] = false;
      addressInfo['assetid'] = assetIDS['L-BTC'];
    }
    setSendingAmount(addressInfo.amount);
    setPaymentInfo({type: 'liquid', addressInfo: addressInfo});
  }

  async function setupLNPage(input) {
    try {
      try {
        if (input.type === InputTypeVariant.LN_URL_AUTH) {
          const result = await lnurlAuth(input.data);
          if (result.type === LnUrlCallbackStatusVariant.OK)
            Alert.alert('LNURL successfully authenticated', '', [
              {text: 'Ok', onPress: () => goBackFunction()},
            ]);
          else
            Alert.alert('Failed to authenticate LNURL', '', [
              {text: 'Ok', onPress: () => goBackFunction()},
            ]);
          return;
        } else if (input.type === InputTypeVariant.LN_URL_PAY) {
          const amountMsat = input.data.minSendable;
          setSendingAmount(amountMsat);
          setPaymentInfo(input);

          return;
        }

        // else if (input.type === InputTypeVariant.LN_URL_WITHDRAW) {
        //   try {
        //     await withdrawLnurl({
        //       data: input.data,
        //       amountMsat: input.data.minWithdrawable,
        //       description: input.data.defaultDescription,
        //     });
        //     setHasError('Retrieving LNURL amount');
        //   } catch (err) {
        //     console.log(err);
        //     setHasError('Error comnpleting withdrawl');
        //   }

        //   return;
        // }
        setSendingAmount(
          !input.invoice.amountMsat ? null : input.invoice.amountMsat,
        );
        setPaymentInfo(input);

        // setIsLoading(false);
      } catch (err) {
        Alert.alert(
          'Not a valid LN Address',
          'Please try again with a bolt 11 address',
          [{text: 'Ok', onPress: () => goBackFunction()}],
        );
        console.log(err);
      }
    } catch (err) {
      console.log(err);
    }
  }

  function goBackFunction() {
    navigate.goBack();
  }
}

const styles = StyleSheet.create({
  popupContainer: {
    flex: 1,
  },

  innerContainer: {
    flex: 1,
    width: '95%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 30,
    height: 30,
  },
  headerText: {
    fontSize: SIZES.xLarge,
    fontFamily: FONT.Title_Regular,
    ...CENTER,
  },
  subHeaderText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    ...CENTER,
  },

  sendingAmountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  sendingAmtBTC: {
    fontSize: SIZES.huge,
    fontFamily: FONT.Title_Regular,
  },
  invoiceContainer: {
    width: '95%',
    padding: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  invoiceText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Descriptoin_Regular,
  },
  feeBreakdownContainer: {
    width: '85%',
  },
  feeBreakdownRow: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 15,
  },
  feeBreakdownItem: {
    width: '36%',
    textAlign: 'right',

    alignItems: 'flex-end',
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Bold,
  },
  feeBreakdownValue: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
  },

  buttonsContainer: {
    width: '90%',
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    width: '48%',

    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    borderRadius: 5,
    ...SHADOWS.small,
  },
  buttonText: {
    fontSize: SIZES.medium,
    color: COLORS.lightWhite,
    fontFamily: FONT.Other_Regular,
  },
});
