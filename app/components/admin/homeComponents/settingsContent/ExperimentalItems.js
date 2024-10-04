import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SIZES,
  VALID_URL_REGEX,
} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import CustomToggleSwitch from '../../../../functions/CustomElements/switch';
import {useCallback, useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import {getPublicKey} from 'nostr-tools';
import {encriptMessage} from '../../../../functions/messaging/encodingAndDecodingMessages';
import {backArrow} from '../../../../constants/styles';
import {useGlobaleCash} from '../../../../../context-store/eCash';
import {sumProofsValue} from '../../../../functions/eCash/proofs';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import handleBackPress from '../../../../hooks/handleBackPress';
import GetThemeColors from '../../../../hooks/themeColors';
import ThemeImage from '../../../../functions/CustomElements/themeImage';

export default function ExperimentalItemsPage() {
  const {
    theme,
    toggleMasterInfoObject,
    masterInfoObject,
    contactsPrivateKey,
    nodeInformation,
    darkModeType,
  } = useGlobalContextProvider();
  const {
    parsedEcashInformation,
    currentMint,
    globalEcashInformation,
    toggleGLobalEcashInformation,
  } = useGlobaleCash();
  const publicKey = getPublicKey(contactsPrivateKey);
  const {
    textColor,
    backgroundOffset,
    backgroundColor,
    textInputBackground,
    textInputColor,
  } = GetThemeColors();
  const navigate = useNavigation();

  const [mintURL, setMintURL] = useState('');

  const enabledEcash = masterInfoObject.enabledEcash;
  const currentMintURL = currentMint?.mintURL;

  const handleBackPressFunction = useCallback(() => {
    if (!currentMintURL && enabledEcash) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Must input a mintURL to enable ecash',
      });
      return true;
    } else {
      navigate.goBack();
    }
    return true;
  }, [navigate, currentMintURL, enabledEcash]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  console.log(currentMint);

  return (
    <GlobalThemeView useStandardWidth={true}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={styles.topbar}>
          <TouchableOpacity
            style={{position: 'absolute', top: 0, left: 0, zIndex: 1}}
            onPress={() => {
              if (!currentMint.mintURL && masterInfoObject.enabledEcash) {
                navigate.navigate('ErrorScreen', {
                  errorMessage: 'Must input a mintURL to enable ecash',
                });
                return;
              }
              Keyboard.dismiss();
              navigate.goBack();
            }}>
            <ThemeImage
              lightsOutIcon={ICONS.arrow_small_left_white}
              darkModeIcon={ICONS.smallArrowLeft}
              lightModeIcon={ICONS.smallArrowLeft}
            />
          </TouchableOpacity>
          <ThemeText content={'Experimental'} styles={{...styles.topBarText}} />
        </View>
        <View style={{flex: 1, width: '95%', ...CENTER}}>
          <ScrollView>
            <ThemeText
              styles={{marginTop: 20, fontSize: SIZES.large}}
              content={'eCash'}
            />
            <View
              style={{
                backgroundColor: backgroundOffset,
                borderRadius: 8,
                marginTop: 20,
              }}>
              <View
                style={[
                  styles.switchContainer,
                  {
                    borderBottomColor: backgroundColor,
                  },
                ]}>
                <View style={styles.inlineItemContainer}>
                  <ThemeText content={`Use eCash`} />
                  <CustomToggleSwitch page={'eCash'} />
                </View>
              </View>
              <View style={styles.warningContainer}>
                <ThemeText
                  styles={{...styles.warningText}}
                  content={
                    'By turning on eCash you agree to the risk that your funds might be lost. Unlike Bitcoin which is self-custodial and Liquid which is a federated model, eCash is custodial and therefore your funds can be taken.'
                  }
                />
              </View>
            </View>
            {masterInfoObject.enabledEcash && (
              <>
                {/* <ThemeText
                  styles={{marginTop: 20, fontSize: SIZES.large}}
                  content={'Find a Mint'}
                />
                <TouchableOpacity
                  onPress={() => {
                    (async () => {
                      try {
                        await WebBrowser.openBrowserAsync(
                          'https://bitcoinmints.com/?tab=mints',
                        );
                      } catch (err) {
                        console.log(err, 'OPENING LINK ERROR');
                      }
                    })();
                  }}>
                  <ThemeText
                    styles={{
                      color: COLORS.primary,
                      fontSize: SIZES.small,
                    }}
                    content={'Click here to find mints'}
                  />
                </TouchableOpacity> */}
                <ThemeText
                  styles={{marginTop: 20, fontSize: SIZES.large}}
                  content={'Enter a Mint'}
                />
                <TouchableOpacity
                  onPress={() => {
                    (async () => {
                      try {
                        await WebBrowser.openBrowserAsync(
                          'https://bitcoinmints.com/?tab=mints',
                        );
                      } catch (err) {
                        console.log(err, 'OPENING LINK ERROR');
                      }
                    })();
                  }}>
                  <ThemeText
                    styles={{
                      color:
                        theme && darkModeType
                          ? COLORS.darkModeText
                          : COLORS.primary,
                      fontSize: SIZES.small,
                      // marginTop: 5,
                    }}
                    content={'Click here to find mints'}
                  />
                </TouchableOpacity>
                <View
                  style={{
                    backgroundColor: backgroundOffset,
                    borderRadius: 8,
                    marginTop: 15,
                  }}>
                  <TextInput
                    onBlur={() => {
                      if (!mintURL || !mintURL.trim()) return;
                      if (!VALID_URL_REGEX.test(mintURL)) {
                        navigate.navigate('ErrorScreen', {
                          errorMessage: 'You did not enter a valid URL',
                        });
                        return;
                      }
                      switchMint(mintURL, false);
                    }}
                    placeholder="Mint url"
                    style={{
                      ...styles.textInputStyle,
                      backgroundColor: textInputBackground,
                      color: textInputColor,
                    }}
                    placeholderTextColor={COLORS.opaicityGray}
                    onChangeText={setMintURL}
                    value={mintURL}
                  />
                </View>
                <ThemeText
                  styles={{marginTop: 20, fontSize: SIZES.large}}
                  content={'Added Mints'}
                />
                {parsedEcashInformation.map((mint, id) => {
                  const proofValue = sumProofsValue(mint.proofs);
                  return (
                    <TouchableOpacity
                      activeOpacity={mint.isCurrentMint ? 1 : 0.4}
                      onPress={() => {
                        if (mint.isCurrentMint) return;
                        switchMint(mint.mintURL, true);
                      }}
                      style={{
                        alignItems: 'baseline',
                        backgroundColor: backgroundOffset,
                        padding: 10,
                        borderRadius: 8,
                        marginVertical: 10,
                      }}
                      key={id}>
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        <ThemeText
                          styles={{fontSize: SIZES.small}}
                          content={mint.mintURL}
                        />
                        <TouchableOpacity
                          activeOpacity={mint.isCurrentMint ? 1 : 0.4}
                          onPress={() => {
                            if (mint.isCurrentMint) return;
                            if (proofValue > 0) {
                              navigate.navigate('ConfirmActionPage', {
                                confirmMessage: `You have a balance of ${proofValue} sat${
                                  proofValue === 1 ? '' : 's'
                                }. If you delete this mint you will lose your sats. Click yes to delete.`,
                                deleteMint: () => deleteMint(mint.mintURL),
                              });
                              return;
                            }
                            deleteMint(mint.mintURL);
                          }}>
                          <Image
                            style={{width: 25, height: 25}}
                            source={
                              mint.isCurrentMint
                                ? theme && darkModeType
                                  ? ICONS.starWhite
                                  : ICONS.starBlue
                                : theme && darkModeType
                                ? ICONS.trashIconWhite
                                : ICONS.trashIcon
                            }
                          />
                        </TouchableOpacity>
                      </View>
                      <FormattedSatText
                        neverHideBalance={true}
                        iconHeight={10}
                        iconWidth={10}
                        frontText={'Balance: '}
                        containerStyles={{marginTop: 10}}
                        styles={{
                          includeFontPadding: false,
                          fontSize: SIZES.small,
                        }}
                        globalBalanceDenomination={
                          masterInfoObject.userBalanceDenomination
                        }
                        formattedBalance={formatBalanceAmount(
                          numberConverter(
                            proofValue || 0,
                            masterInfoObject.userBalanceDenomination,
                            nodeInformation,
                            masterInfoObject.userBalanceDenomination != 'fiat'
                              ? 0
                              : 2,
                          ),
                        )}
                      />
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </GlobalThemeView>
  );

  function deleteMint(mintURL) {
    const newMintList = parsedEcashInformation.filter(mintInfo => {
      return mintInfo.mintURL != mintURL;
    });
    toggleGLobalEcashInformation(
      encriptMessage(
        contactsPrivateKey,
        publicKey,
        JSON.stringify(newMintList),
      ),
      true,
    );
  }

  function switchMint(newMintURL, isFromList) {
    const isSavedMint = parsedEcashInformation.find(mintInfo => {
      return mintInfo.mintURL === newMintURL;
    });

    if (newMintURL === currentMint.mintURL) return;

    let newMintInfo;

    if (!isSavedMint && parsedEcashInformation.length === 0) {
      newMintInfo = [
        {
          proofs: [],
          transactions: [],
          mintURL: newMintURL,
          isCurrentMint: true,
        },
      ];
    } else {
      if (isSavedMint) {
        newMintInfo = parsedEcashInformation.map(mint => {
          if (mint.mintURL === newMintURL.trim()) {
            return {...mint, isCurrentMint: true};
          } else return {...mint, isCurrentMint: false};
        });
      } else {
        const tempArray = parsedEcashInformation.map(mint => {
          return {...mint, isCurrentMint: false};
        });
        newMintInfo = [
          ...tempArray,
          {
            proofs: [],
            transactions: [],
            mintURL: newMintURL,
            isCurrentMint: true,
          },
        ];
      }
    }

    setMintURL('');
    toggleGLobalEcashInformation(
      encriptMessage(
        contactsPrivateKey,
        publicKey,
        JSON.stringify(newMintInfo),
      ),
      true,
    );

    if (isFromList) return;
    setTimeout(() => {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Mint Saved Succesfully',
      });
    }, 300);
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  topBarText: {
    fontSize: SIZES.xLarge,
    width: '100%',
    textAlign: 'center',
    fontFamily: FONT.Title_Regular,
  },

  settingsContainer: {
    flex: 1,
    width: '100%',
  },

  switchContainer: {
    flexDirection: 'row',
    width: '95%',
    marginLeft: 'auto',
    borderBottomWidth: 1,
  },
  inlineItemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingRight: '5%',
  },

  warningContainer: {
    width: '95%',
    marginLeft: 'auto',
    paddingVertical: 10,
  },
  warningText: {
    width: '90%',
  },
  textInputStyle: {
    padding: 10,
    borderRadius: 8,
  },
});
