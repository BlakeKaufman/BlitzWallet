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
import {useEffect, useState} from 'react';
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

export default function ExperimentalItemsPage() {
  const {
    theme,
    toggleMasterInfoObject,
    masterInfoObject,
    contactsPrivateKey,
    nodeInformation,
  } = useGlobalContextProvider();
  const {
    parsedEcashInformation,
    currentMint,
    globalEcashInformation,
    toggleGLobalEcashInformation,
  } = useGlobaleCash();
  const publicKey = getPublicKey(contactsPrivateKey);
  const navigate = useNavigation();

  const [mintURL, setMintURL] = useState(
    currentMint ? currentMint.mintURL : '',
  );

  function handleBackPressFunction() {
    if (!currentMint.mintURL && masterInfoObject.enabledEcash) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Must input a mintURL to enable ecash',
      });
      return true;
    }
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

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
            <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
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
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
                borderRadius: 8,
                marginTop: 20,
              }}>
              <View
                style={[
                  styles.switchContainer,
                  {
                    borderBottomColor: theme
                      ? COLORS.darkModeBackground
                      : COLORS.lightModeBackground,
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
                <ThemeText
                  styles={{marginTop: 20, fontSize: SIZES.large}}
                  content={'Current Mint'}
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
                </TouchableOpacity>
                <View
                  style={{
                    backgroundColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,
                    borderRadius: 8,
                    marginTop: 20,
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
                      switchMint(mintURL);
                    }}
                    placeholder="mint url"
                    style={{
                      ...styles.textInputStyle,
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    }}
                    onChangeText={setMintURL}
                    value={currentMint.mintURL}
                  />
                </View>
                <ThemeText
                  styles={{marginTop: 20, fontSize: SIZES.large}}
                  content={'Past Mints'}
                />
                {parsedEcashInformation.map((mint, id) => {
                  if (mint.isCurrentMint) return;
                  const proofValue = sumProofsValue(mint.proofs);
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        switchMint(mint.mintURL);
                      }}
                      style={{
                        alignItems: 'baseline',
                        backgroundColor: theme
                          ? COLORS.darkModeBackgroundOffset
                          : COLORS.lightModeBackgroundOffset,
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
                          onPress={() => {
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
                            source={ICONS.trashIcon}
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

  function switchMint(newMintURL) {
    const isSavedMint = parsedEcashInformation.find(mintInfo => {
      return mintInfo.mintURL === newMintURL;
    });

    if (newMintURL === currentMint.mintURL) return;

    let newMintInfo;

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

    setMintURL(newMintURL);
    toggleGLobalEcashInformation(
      encriptMessage(
        contactsPrivateKey,
        publicKey,
        JSON.stringify(newMintInfo),
      ),
      true,
    );
    navigate.navigate('ErrorScreen', {errorMessage: 'Mint Saved Succesfully'});
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
  },
});
