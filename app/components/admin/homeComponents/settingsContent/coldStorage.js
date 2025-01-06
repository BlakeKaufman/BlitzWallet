import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {ThemeText} from '../../../../functions/CustomElements';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import {useNavigation} from '@react-navigation/native';
import CustomSearchInput from '../../../../functions/CustomElements/searchInput';
import {useState} from 'react';
import GetThemeColors from '../../../../hooks/themeColors';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import Icon from '../../../../functions/CustomElements/Icon';
import CustomButton from '../../../../functions/CustomElements/button';
import * as xpubLib from '@swan-bitcoin/xpub-lib';
import * as ecc from '@bitcoinerlab/secp256k1';
import * as descriptors from '@bitcoinerlab/descriptors';
const {Output} = descriptors.DescriptorsFactory(ecc);
import * as BtcOutDesc from '@blockchainofthings/btc-output-descriptor';

const WALLET_DESCRIPTOR_TYPE_VALIDATOR = /^(xpub|ypub|zpub)/;

export default function ColdStorage() {
  const {darkModeType, theme} = useGlobalContextProvider();
  const navigate = useNavigation();
  const [walletDescriptorInformation, setWalletDescriptorInformation] =
    useState({
      descriptor: '',
      network: '',
      name: '',
    });
  const {textInputColor, textInputBackground, backgroundOffset} =
    GetThemeColors();

  console.log(walletDescriptorInformation);
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{flex: 1, width: '95%', ...CENTER}}
        behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <ScrollView>
          <View style={styles.headerContainer}>
            <ThemeText
              styles={styles.headerText}
              content={'Watch-only details'}
            />
            <TouchableOpacity
              onPress={() => {
                navigate.navigate('InformationPopup', {
                  textContent:
                    'A watch-only wallet is like "read-only" mode for your money. It lets you see your balance and receive payments without giving anyone access to your secure recovery phrase. Blitz Wallet uses this to link to your cold storage wallet safely.',
                  buttonText: 'I understand',
                });
              }}>
              <ThemeImage
                styles={styles.headerImage}
                darkModeIcon={ICONS.aboutIcon}
                lightModeIcon={ICONS.aboutIcon}
                lightsOutIcon={ICONS.aboutIconWhite}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.formExplainerWithInfoContainer}>
            <ThemeText
              styles={styles.formExplainerWithInfo}
              content={'Enter wallet name'}
            />
            <TouchableOpacity
              onPress={() => {
                navigate.navigate('InformationPopup', {
                  textContent:
                    'If you want to import multiple watch-only wallets, make sure to give each one a name so you can easily tell them apart. This has no baring over the watch-only wallet.',
                  buttonText: 'I understand',
                });
              }}>
              <ThemeImage
                styles={styles.headerImage}
                darkModeIcon={ICONS.aboutIcon}
                lightModeIcon={ICONS.aboutIcon}
                lightsOutIcon={ICONS.aboutIconWhite}
              />
            </TouchableOpacity>
          </View>
          <CustomSearchInput
            inputText={walletDescriptorInformation.name}
            setInputText={e =>
              setWalletDescriptorInformation(prev => ({...prev, name: e}))
            }
            placeholderText={'Name...'}
          />
          <ThemeText
            styles={styles.formExplainer}
            content={
              'Scan or enter your extended public key (xPub/yPub/xPub) or public descriptor to log into your watch-only wallet.'
            }
          />
          <View
            style={{
              ...styles.formContainerStyles,
              backgroundColor: textInputBackground,
            }}>
            <TextInput
              multiline={true}
              style={{
                ...styles.searchInput,
                color: textInputColor,
              }}
              value={walletDescriptorInformation.descriptor}
              onChangeText={e => {
                console.log(e);
                setWalletDescriptorInformation(prev => {
                  return {...prev, descriptor: e};
                });
              }}
            />
            <TouchableOpacity
              onPress={() => {
                navigate.navigate('CameraModal', {
                  updateBitcoinAdressFunc: handleScannedDescriptor,
                });
              }}
              style={styles.scanQrCode}>
              <ThemeImage
                lightModeIcon={ICONS.scanQrCodeBlue}
                darkModeIcon={ICONS.scanQrCodeBlue}
                lightsOutIcon={ICONS.scanQrCodeLight}
              />
            </TouchableOpacity>
          </View>
          <ThemeText
            styles={{...styles.formExplainer, marginBottom: 20}}
            content={'Select the network for the watch-only wallet.'}
          />
          <TouchableOpacity
            onPress={() => {
              setWalletDescriptorInformation(prev => {
                return {...prev, network: 'liquid'};
              });
            }}
            style={styles.contentContainer}>
            <ThemeText content={`Liquid`} />
            <View
              style={{
                ...styles.circleContainer,
                backgroundColor:
                  walletDescriptorInformation.network === 'liquid'
                    ? theme
                      ? backgroundOffset
                      : COLORS.primary
                    : 'transparent',
                borderWidth:
                  walletDescriptorInformation.network === 'liquid' ? 0 : 2,
                borderColor: theme ? backgroundOffset : COLORS.white,
              }}>
              {walletDescriptorInformation.network === 'liquid' && (
                <Icon
                  width={15}
                  height={15}
                  color={COLORS.darkModeText}
                  name={'expandedTxCheck'}
                />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setWalletDescriptorInformation(prev => {
                return {...prev, network: 'bitcoin'};
              });
            }}
            style={styles.contentContainer}>
            <ThemeText content={`Bitcoin`} />
            <View
              style={{
                ...styles.circleContainer,
                backgroundColor:
                  walletDescriptorInformation.network === 'bitcoin'
                    ? theme
                      ? backgroundOffset
                      : COLORS.primary
                    : 'transparent',
                borderWidth:
                  walletDescriptorInformation.network === 'bitcoin' ? 0 : 2,
                borderColor: theme ? backgroundOffset : COLORS.white,
              }}>
              {walletDescriptorInformation.network === 'bitcoin' && (
                <Icon
                  width={15}
                  height={15}
                  color={COLORS.darkModeText}
                  name={'expandedTxCheck'}
                />
              )}
            </View>
          </TouchableOpacity>
        </ScrollView>
        <CustomButton
          buttonStyles={{
            ...styles.importBTNStyle,
            opacity:
              !walletDescriptorInformation.descriptor ||
              !walletDescriptorInformation.network
                ? 0.5
                : 1,
          }}
          textContent={'Import'}
          actionFunction={createWatchOnlyWallet}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );

  function handleScannedDescriptor(value) {
    setWalletDescriptorInformation(prev => {
      return {...prev, descriptor: value};
    });
  }
  async function createWatchOnlyWallet() {
    if (
      !walletDescriptorInformation.descriptor ||
      !walletDescriptorInformation.network
    )
      return;
    let formattedWallet = {...walletDescriptorInformation};

    if (walletDescriptorInformation.network === 'bitcoin') {
      //   address
      if (
        WALLET_DESCRIPTOR_TYPE_VALIDATOR.test(
          walletDescriptorInformation.descriptor,
        )
      ) {
        if (
          !xpubLib.isValidExtPubKey(
            walletDescriptorInformation.descriptor,
            'mainnet',
          )
        ) {
          navigate.navigate('ErrorScreen', {
            errorMessage: 'Not a valid xpub/ypub/zpub',
          });
          return;
        }
        const extPubKeyType = walletDescriptorInformation.descriptor.slice(
          0,
          1,
        );
        console.log(extPubKeyType);
        formattedWallet['addressType'] =
          extPubKeyType === 'x'
            ? 'P2PKH'
            : extPubKeyType === 'y'
            ? 'P2SH'
            : 'P2WPKH';
      } else {
        const expression = BtcOutDesc.parse(
          walletDescriptorInformation.descriptor,
          'main',
        );

        console.log(expression);
      }
    } else {
    }
    console.log(formattedWallet);
    console.log(
      xpubLib.addressFromExtPubKey({
        extPubKey: walletDescriptorInformation.descriptor,
        network: 'mainnet',
        purpose: xpubLib.Purpose.P2SH,
        keyIndex: 1,
      }),
    );
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  headerText: {
    fontSize: SIZES.xLarge,
    includeFontPadding: false,
    marginRight: 5,
  },
  headerImage: {
    width: 20,
    height: 20,
  },
  formExplainer: {
    textAlign: 'center',
    marginTop: 10,
    includeFontPadding: false,
  },
  formExplainerWithInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 5,
  },
  formExplainerWithInfo: {
    textAlign: 'center',
    includeFontPadding: false,
    marginRight: 5,
  },
  formContainerStyles: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  searchInput: {
    width: '100%',
    minHeight: 50,
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    includeFontPadding: false,
    ...CENTER,
  },
  scanQrCode: {
    marginLeft: 'auto',
    marginTop: 5,
  },
  contentContainer: {
    width: 220,
    minHeight: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 0,
    ...CENTER,
  },
  circleContainer: {
    height: 30,
    width: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importBTNStyle: {
    ...CENTER,
  },
});
