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
  FiatCurrencyPage,
  FundWalletGift,
  GainsCalculator,
  LSPPage,
  LiquidWallet,
  NodeInfo,
  NosterWalletConnect,
  ResetPage,
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

export default function SettingsContentIndex(props) {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();
  const selectedPage = props.route.params.for;

  return (
    <GlobalThemeView styles={{alignItems: 'center'}}>
      <View style={styles.innerContainer}>
        <View style={styles.topbar}>
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              navigate.goBack();
            }}>
            <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
          </TouchableOpacity>
          <ThemeText content={selectedPage} styles={{...styles.topBarText}} />
        </View>

        {/* <View style={{flex: 1}}> */}
        {selectedPage?.toLowerCase() === 'about' && <AboutPage theme={theme} />}

        {selectedPage?.toLowerCase() === 'fiat currency' && (
          <FiatCurrencyPage theme={theme} />
        )}
        {selectedPage?.toLowerCase() === 'node info' && (
          <NodeInfo theme={theme} />
        )}
        {selectedPage?.toLowerCase() === 'display options' && (
          <DisplayOptions theme={theme} />
        )}
        {selectedPage?.toLowerCase() === 'send on-chain' && (
          <SendOnChainBitcoin theme={theme} />
        )}
        {selectedPage?.toLowerCase() === 'wallet stats' && (
          <WalletInformation theme={theme} />
        )}
        {selectedPage?.toLowerCase() === 'view liquid swaps' && (
          <ViewAllLiquidSwaps theme={theme} />
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

        {selectedPage?.toLowerCase() === 'recovery phrase' && (
          <SeedPhrasePage theme={theme} />
        )}

        {selectedPage?.toLowerCase() === 'lsp' && <LSPPage theme={theme} />}
        {selectedPage?.toLowerCase() === 'data storage' && (
          <DataStorageOptions theme={theme} />
        )}

        {selectedPage?.toLowerCase() === 'bank' && (
          <LiquidWallet theme={theme} />
        )}

        {selectedPage?.toLowerCase() === 'reset wallet' && <ResetPage />}
        {selectedPage?.toLowerCase() === 'drain wallet' && <DrainPage />}
        {/* </View> */}
      </View>
    </GlobalThemeView>
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
    fontSize: SIZES.large,
    // marginRight: 'auto',
    marginLeft: 'auto',
    // transform: [{translateX: -15}],
    fontFamily: FONT.Title_Bold,
  },
});
