import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Keyboard,
} from 'react-native';
import {FONT, ICONS, SIZES} from '../../constants';
import {
  AboutPage,
  BiometricLoginPage,
  DataStorageOptions,
  DisplayOptions,
  DrainPage,
  ExperimentalItemsPage,
  FiatCurrencyPage,
  FundWalletGift,
  GainsCalculator,
  LSPPage,
  LiquidWallet,
  NodeInfo,
  NosterWalletConnect,
  PosSettingsPage,
  ResetPage,
  RestoreChannel,
  SeedPhrasePage,
  SendOnChainBitcoin,
  ViewAllLiquidSwaps,
  WalletInformation,
} from '../../components/admin/homeComponents/settingsContent';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {backArrow} from '../../constants/styles';
import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import {WINDOWWIDTH} from '../../constants/theme';
import handleBackPress from '../../hooks/handleBackPress';
import {useEffect} from 'react';
import POSInstructionsPath from '../../components/admin/homeComponents/settingsContent/posPath/posInstructionsPath';
import {EditMyProfilePage} from '../../components/admin';
import ThemeImage from '../../functions/CustomElements/themeImage';

export default function SettingsContentIndex(props) {
  const navigate = useNavigation();
  const {theme, nodeInformation} = useGlobalContextProvider();
  const selectedPage = props.route.params.for;

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  return (
    <>
      {selectedPage?.toLowerCase() === 'display currency' ||
      selectedPage?.toLowerCase() === 'experimental' ||
      selectedPage?.toLowerCase() === 'bank' ? (
        <>
          {selectedPage?.toLowerCase() === 'display currency' && (
            <FiatCurrencyPage theme={theme} />
          )}
          {selectedPage?.toLowerCase() === 'experimental' && (
            <ExperimentalItemsPage />
          )}
          {selectedPage?.toLowerCase() === 'bank' && (
            <LiquidWallet theme={theme} />
          )}
        </>
      ) : (
        <GlobalThemeView styles={{alignItems: 'center'}}>
          <View style={styles.innerContainer}>
            <View style={styles.topbar}>
              <TouchableOpacity
                style={{position: 'absolute', top: 0, left: 0, zIndex: 1}}
                onPress={() => {
                  Keyboard.dismiss();

                  navigate.goBack();
                }}>
                <ThemeImage
                  lightsOutIcon={ICONS.arrow_small_left_white}
                  darkModeIcon={ICONS.smallArrowLeft}
                  lightModeIcon={ICONS.smallArrowLeft}
                />
              </TouchableOpacity>
              <ThemeText
                content={selectedPage}
                styles={{...styles.topBarText}}
              />
              {(selectedPage?.toLowerCase() === 'on-chain funds' ||
                selectedPage?.toLowerCase() === 'bank') && (
                <TouchableOpacity
                  style={{position: 'absolute', top: 0, right: 0, zIndex: 1}}
                  onPress={() => {
                    Keyboard.dismiss();

                    if (selectedPage?.toLowerCase() === 'bank') {
                      if (!nodeInformation.didConnectToNode) {
                        navigate.navigate('ErrorScreen', {
                          errorMessage:
                            'Please reconnect to the internet to use this feature',
                        });
                        return;
                      }
                      navigate.navigate('LiquidSettingsPage');
                      return;
                    }

                    navigate.navigate('HistoricalOnChainPayments');
                  }}>
                  <ThemeImage
                    lightsOutIcon={
                      selectedPage?.toLowerCase() === 'bank'
                        ? ICONS.settingsWhite
                        : ICONS.receiptWhite
                    }
                    darkModeIcon={
                      selectedPage?.toLowerCase() === 'bank'
                        ? ICONS.settingsIcon
                        : ICONS.receiptIcon
                    }
                    lightModeIcon={
                      selectedPage?.toLowerCase() === 'bank'
                        ? ICONS.settingsIcon
                        : ICONS.receiptIcon
                    }
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* <View style={{flex: 1}}> */}
            {selectedPage?.toLowerCase() === 'about' && (
              <AboutPage theme={theme} />
            )}

            {selectedPage?.toLowerCase() === 'node info' && (
              <NodeInfo theme={theme} />
            )}
            {selectedPage?.toLowerCase() === 'display options' && (
              <DisplayOptions theme={theme} />
            )}
            {selectedPage?.toLowerCase() === 'on-chain funds' && (
              <SendOnChainBitcoin theme={theme} />
            )}
            {selectedPage?.toLowerCase() === 'balance info' && (
              <WalletInformation theme={theme} />
            )}
            {selectedPage?.toLowerCase() === 'view liquid swaps' && (
              <ViewAllLiquidSwaps theme={theme} />
            )}
            {selectedPage?.toLowerCase() === 'edit contact profile' && (
              <EditMyProfilePage fromSettings={true} pageType="myProfile" />
            )}
            {selectedPage?.toLowerCase() === 'create gift' && (
              <FundWalletGift theme={theme} />
            )}

            {selectedPage?.toLowerCase() === 'noster wallet connect' && (
              <NosterWalletConnect theme={theme} />
            )}
            {selectedPage?.toLowerCase() === 'biometric login' && (
              <BiometricLoginPage theme={theme} />
            )}

            {selectedPage?.toLowerCase() === 'backup wallet' && (
              <SeedPhrasePage theme={theme} />
            )}

            {selectedPage?.toLowerCase() === 'lsp' && <LSPPage theme={theme} />}
            {selectedPage?.toLowerCase() === 'data storage' && (
              <DataStorageOptions theme={theme} />
            )}

            {selectedPage?.toLowerCase() === 'reset wallet' && <ResetPage />}
            {selectedPage?.toLowerCase() === 'restore channels' && (
              <RestoreChannel />
            )}
            {selectedPage?.toLowerCase() === 'drain wallet' && <DrainPage />}

            {selectedPage?.toLowerCase() === 'point-of-sale' && (
              <PosSettingsPage />
            )}
            {selectedPage?.toLowerCase() === 'pos instructions' && (
              <POSInstructionsPath />
            )}

            {/* </View> */}
          </View>
        </GlobalThemeView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    width: WINDOWWIDTH,
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
});
