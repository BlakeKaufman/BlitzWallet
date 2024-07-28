import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {FONT, ICONS, SIZES} from '../../../../constants';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import {useNavigation} from '@react-navigation/native';
import {ThemeText} from '../../../../functions/CustomElements';
import getFormattedHomepageTxs from '../../../../functions/combinedTransactions';

export default function LiquidWallet() {
  const {nodeInformation, masterInfoObject, liquidNodeInformation, theme} =
    useGlobalContextProvider();
  const showAmount = masterInfoObject.userBalanceDenomination != 'hidden';
  const navigate = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <ThemeText
          content={'Balance'}
          styles={{marginTop: 10, textTransform: 'uppercase'}}
        />
        <View style={styles.valueContainer}>
          <ThemeText
            content={formatBalanceAmount(
              numberConverter(
                liquidNodeInformation.userBalance,
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
              ),
            )}
            styles={{...styles.valueText}}
          />
          <ThemeText
            content={
              masterInfoObject.userBalanceDenomination != 'fiat'
                ? 'sats'
                : nodeInformation.fiatStats?.coin
            }
            styles={{...styles.denominatorText}}
          />
        </View>
      </View>
      <FlatList
        style={{flex: 1, width: '100%'}}
        showsVerticalScrollIndicator={false}
        data={getFormattedHomepageTxs({
          nodeInformation,
          liquidNodeInformation,
          masterInfoObject,
          theme,
          navigate,
          showAmount,
          isBankPage: true,
        })}
        renderItem={({item}) => item}
      />

      <TouchableOpacity
        onPress={() => {
          if (!nodeInformation.didConnectToNode) {
            navigate.navigate('ErrorScreen', {
              errorMessage:
                'Please reconnect to the internet to use this feature',
            });
            return;
          }
          navigate.navigate('LiquidSettingsPage');
        }}>
        <View style={{alignItems: 'center', paddingTop: 5}}>
          <ThemeText content={'Advanced Settings'} />
          <Image
            source={ICONS.leftCheveronIcon}
            style={{width: 20, height: 20, transform: [{rotate: '270deg'}]}}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 5,
  },

  topBar: {
    alignItems: 'center',
  },

  denominatorText: {
    fontSize: SIZES.large,
    fontFamily: FONT.Title_Regular,
  },
  valueText: {
    fontSize: SIZES.xxLarge,
    fontFamily: FONT.Title_Regular,
    marginHorizontal: 5,
  },
});
