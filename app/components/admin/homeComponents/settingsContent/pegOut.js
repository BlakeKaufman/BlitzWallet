import {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ThemeText} from '../../../../functions/CustomElements';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';
import {CENTER, ICONS, SIZES} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import {formatBalanceAmount, numberConverter} from '../../../../functions';

export default function PegOutPage(props) {
  const {nodeInformation, liquidNodeInformation, masterInfoObject} =
    useGlobalContextProvider();
  const [bitcoinAddress, setBitcoinAddress] = useState(
    props?.route?.params?.bitcoinAddress || '',
  );
  const navigate = useNavigation();
  return (
    <View style={styles.globalContainer}>
      <View style={{...styles.infoContainer, marginTop: 20}}>
        <ThemeText
          styles={{marginRight: 5}}
          content={'Available balance to send'}
        />
        <TouchableOpacity
          onPress={() => {
            navigate.navigate('ExplainScreenPopup', {page: 'pegOutPage'});
          }}>
          <ThemeImage
            styles={{width: 20, height: 20}}
            lightsOutIcon={ICONS.aboutIconWhite}
            lightModeIcon={ICONS.aboutIcon}
            darkModeIcon={ICONS.aboutIcon}
          />
        </TouchableOpacity>
      </View>
      <FormattedSatText
        containerStyles={{...CENTER}}
        neverHideBalance={true}
        iconHeight={15}
        iconWidth={15}
        styles={{includeFontPadding: false, ...styles.balanceText}}
        formattedBalance={formatBalanceAmount(
          numberConverter(
            liquidNodeInformation.userBalance,
            masterInfoObject.userBalanceDenomination,
            nodeInformation,
            masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
          ),
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: SIZES.xxLarge,
  },
});
