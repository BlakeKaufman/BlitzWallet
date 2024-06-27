import {StyleSheet, View, Image, TouchableOpacity} from 'react-native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {FONT, ICONS, SIZES} from '../../../../constants';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import {FormattedLiquidTransactions} from './bankComponents/formattedTransactions';
import {useNavigation} from '@react-navigation/native';
import {ThemeText} from '../../../../functions/CustomElements';

export default function LiquidWallet() {
  const {nodeInformation, masterInfoObject, liquidNodeInformation} =
    useGlobalContextProvider();

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
      <View style={{flex: 1}}>
        <FormattedLiquidTransactions />
      </View>
      <TouchableOpacity
        onPress={() => {
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
