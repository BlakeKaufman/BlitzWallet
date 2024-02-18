import {useRef, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Share,
} from 'react-native';
import {COLORS, FONT, ICONS, SHADOWS, SIZES} from '../../../../constants';
import {BTN, CENTER, backArrow, headerText} from '../../../../constants/styles';
import QRCode from 'react-native-qrcode-svg';
import {receivePayment} from '@breeztech/react-native-breez-sdk';
import {randomUUID} from 'expo-crypto';
import {getLocalStorageItem, setLocalStorageItem} from '../../../../functions';
import {removeLocalStorageItem} from '../../../../functions/localStorage';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

export default function FaucetReceivePage(props) {
  const isInitialRender = useRef(true);
  const [numReceived, setNumReceived] = useState(0);
  const [receiveAddress, setReceiveAddress] = useState('');
  const [isGeneratinAddress, setIsGeneratingAddress] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const {breezContextEvent, theme} = useGlobalContextProvider();
  const navigate = useNavigation();
  const {amountPerPerson, numberOfPeople} = props.route.params;

  async function generateAddress() {
    setIsGeneratingAddress(true);

    try {
      const UUID = randomUUID();
      const invoice = await receivePayment({
        amountMsat: amountPerPerson * 1000,
        description: `bwrfd ${UUID}`,
      });
      //   BWRFD = Blitz Wallet Receive Faucet Data
      //   removeLocalStorageItem('faucet');
      const localStorageItem = await getLocalStorageItem('faucet');
      if (!localStorageItem) {
        setLocalStorageItem('faucet', JSON.stringify([UUID]));
      } else {
        const tempArr = JSON.parse(localStorageItem);
        tempArr.push(UUID);
        setLocalStorageItem('faucet', JSON.stringify([...tempArr]));
      }
      console.log(localStorageItem);

      setReceiveAddress(invoice.lnInvoice.bolt11);
      setIsGeneratingAddress(false);
      // console.log(invoice);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (isInitialRender.current) {
      generateAddress();
      isInitialRender.current = false;
    } else {
      console.log(breezContextEvent?.details, 'BREEZ EVENT IN RECEIVE FAUCET');
      (async () => {
        if (
          !breezContextEvent?.details?.payment?.description?.includes('bwrfd')
        )
          return;
        const faucetItemsList = await getLocalStorageItem('faucet');
        const description =
          breezContextEvent?.details?.payment?.description.split(' ')[1];

        if (faucetItemsList?.includes(description)) {
          if (numReceived + 1 >= numberOfPeople) {
            setIsComplete(true);
            setNumReceived(prev => (prev += 1));

            return;
          }
          setNumReceived(prev => (prev += 1));
          generateAddress();
        }
      })();
    }
  }, [breezContextEvent]);

  async function clear() {
    setNumReceived(0);
    setReceiveAddress('');
    await removeLocalStorageItem('faucet');
    navigate.navigate('HomeAdmin');
  }

  return (
    <View
      style={[
        styles.popupContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
        },
      ]}>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.topBar}>
          {!isComplete && (
            <TouchableOpacity
              onPress={() => {
                navigate.goBack();
              }}>
              <Image style={backArrow} source={ICONS.leftCheveronIcon} />
            </TouchableOpacity>
          )}
          <Text
            style={[
              headerText,
              {
                transform: [{translateX: !isComplete ? -12.5 : 0}],
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            Receive Faucet
          </Text>
        </View>
        <View style={styles.contentContainer}>
          {!isComplete && (
            <>
              <View style={styles.qrCodeContainer}>
                {isGeneratinAddress && (
                  <ActivityIndicator
                    size="large"
                    color={theme ? COLORS.darkModeText : COLORS.lightModeText}
                  />
                )}
                {!isGeneratinAddress && (
                  <QRCode
                    size={250}
                    value={receiveAddress ? receiveAddress : "IT'S COMING"}
                    color={theme ? COLORS.darkModeText : COLORS.lightModeText}
                    backgroundColor={
                      theme
                        ? COLORS.darkModeBackground
                        : COLORS.lightModeBackground
                    }
                  />
                )}
              </View>
              <Text
                style={[
                  styles.recivedAmount,
                  {color: isComplete ? 'green' : 'red'},
                ]}>{`${numReceived}/${numberOfPeople}`}</Text>
            </>
          )}
          {/* 
          Num received out of total received
          QR code to be scanned 
           */}
          {isComplete && (
            <View style={styles.completedContainer}>
              <Image style={styles.confirmIcon} source={ICONS.Checkcircle} />
              <Text style={styles.completedText}>Completed</Text>
              <View style={{alignItems: 'center', flex: 1}}>
                <Text
                  style={[
                    styles.youRecievedHeader,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}>
                  You receieved a total of
                </Text>
                <Text
                  style={[
                    styles.recivedAmount,
                    {
                      marginBottom: 'auto',
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}>
                  {(numberOfPeople * amountPerPerson).toLocaleString()} sats
                </Text>
                <TouchableOpacity
                  onPress={clear}
                  style={[styles.button, {backgroundColor: COLORS.primary}]}>
                  <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {!isComplete && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={openShareOptions}
              style={[
                styles.buttonsOpacity,
                {opacity: isGeneratinAddress ? 0.5 : 1},
              ]}>
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={copyToClipboard}
              style={[
                styles.buttonsOpacity,
                {opacity: isGeneratinAddress ? 0.5 : 1},
              ]}>
              <Text style={styles.buttonText}>Copy</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );

  async function copyToClipboard() {
    try {
      if (isGeneratinAddress) return;
      await Clipboard.setStringAsync(receiveAddress);
      navigate.navigate('ClipboardCopyPopup', {didCopy: true});
      return;
    } catch (err) {
      navigate.navigate('ClipboardCopyPopup', {didCopy: false});
    }
  }

  async function openShareOptions() {
    try {
      if (isGeneratinAddress) return;
      await Share.share({
        title: 'Receive Faucet Address',
        message: receiveAddress,
      });
    } catch {
      window.alert('ERROR with sharing');
    }
  }
}

const styles = StyleSheet.create({
  popupContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.background,
    position: 'absolute',
  },

  topBar: {
    flexDirection: 'row',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeContainer: {
    width: '90%',
    maxWidth: 250,
    height: 250,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recivedAmount: {
    fontSize: SIZES.large,
    fontFamily: FONT.Title_Bold,
  },

  //   confirmed
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmIcon: {
    width: 150,
    height: 150,
    marginBottom: 10,
    marginTop: 50,
  },
  completedText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.xLarge,
    marginBottom: 'auto',
  },
  youRecievedHeader: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
    marginTop: 'auto',
    marginBottom: 10,
  },
  button: {
    width: 150,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginTop: 50,
  },
  buttonText: {color: COLORS.white, fontFamily: FONT.Other_Regular},

  buttonsContainer: {
    width: '90%',
    maxWidth: 250,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...CENTER,
    marginTop: 'auto',
  },

  buttonsOpacity: {
    height: '100%',
    width: 100,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    // overflow: "hidden",
    ...SHADOWS.medium,
  },
  buttonText: {
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.medium,
    color: COLORS.background,
  },
});
