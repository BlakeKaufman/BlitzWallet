import {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import {COLORS, FONT, ICONS, SIZES} from '../../constants';
import {
  AboutPage,
  BiometricLoginPage,
  DisplayOptions,
  DrainPage,
  FiatCurrencyPage,
  FundWalletGift,
  GainsCalculator,
  LSPPage,
  NodeInfo,
  NosterWalletConnect,
  RefundFailedLiquidSwaps,
  ResetPage,
  SeedPhrasePage,
  SendOnChainBitcoin,
} from '../../components/admin/homeComponents/settingsContent';
import * as Device from 'expo-device';

import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {backArrow} from '../../constants/styles';

export default function SettingsContentIndex(props) {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();
  const selectedPage = props.route.params.for;

  return (
    <View
      style={[
        styles.globalContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          paddingVertical: Device.osName === 'ios' ? 0 : 10,
        },
      ]}>
      <SafeAreaView style={{flex: 1, width: '95%'}}>
        <View style={styles.topbar}>
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              navigate.goBack();
            }}>
            <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
          </TouchableOpacity>
          <Text
            style={[
              styles.topBarText,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            {selectedPage}
          </Text>
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
        {selectedPage?.toLowerCase() === 'Send On-chain' && (
          <SendOnChainBitcoin theme={theme} />
        )}
        {selectedPage?.toLowerCase() === 'gains calculator' && (
          <GainsCalculator theme={theme} />
        )}
        {selectedPage?.toLowerCase() === 'refund liquid tx' && (
          <RefundFailedLiquidSwaps theme={theme} />
        )}
        {selectedPage?.toLowerCase() === 'fund wallet gift' && (
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

        {selectedPage?.toLowerCase() === 'reset wallet' && <ResetPage />}
        {selectedPage?.toLowerCase() === 'drain wallet' && <DrainPage />}
        {/* </View> */}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    zIndex: 2,
  },
  innerContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.background,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  topBarText: {
    fontSize: SIZES.large,
    marginRight: 'auto',
    marginLeft: 'auto',
    transform: [{translateX: -15}],
    fontFamily: FONT.Title_Bold,
  },
});
