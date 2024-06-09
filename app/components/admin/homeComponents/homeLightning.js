import {StyleSheet, View} from 'react-native';
import {COLORS} from '../../../constants';
import {UserSatAmount} from './homeLightning/userSatAmount';
import {SendRecieveBTNs} from './homeLightning/sendReciveBTNs';
import LiquidityIndicator from './homeLightning/liquidityIndicator';
import {useGlobalContextProvider} from '../../../../context-store/context';
import {UserTransactions} from './homeLightning/userTransactions';
import {listenForLiquidEvents} from '../../../functions/liquidWallet';
import {ThemeText} from '../../../functions/CustomElements';
export default function HomeLightning() {
  console.log('HOME LIGHTNING PAGE');
  const {theme} = useGlobalContextProvider();
  listenForLiquidEvents();

  return (
    <View style={style.globalContainer}>
      <ThemeText
        content={'Total Balance'}
        styles={{
          textTransform: 'uppercase',
          marginTop: 30,
        }}
      />
      <UserSatAmount />
      <LiquidityIndicator />
      <SendRecieveBTNs />
      <ThemeText
        content={'Transactions'}
        styles={{
          paddingBottom: 5,
        }}
      />
      <View style={{flex: 1, width: '100%'}}>
        <View
          style={[
            style.shadowContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,

              shadowColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,
            },
          ]}></View>
        <UserTransactions from="homepage" />
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  globalContainer: {
    flex: 1,
    alignItems: 'center',
  },

  shadowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 10,

    opacity: 0.7,

    shadowOffset: {height: 8, width: 0},

    shadowOpacity: 1,
    elevation: 2,
    zIndex: 1,
  },
});
