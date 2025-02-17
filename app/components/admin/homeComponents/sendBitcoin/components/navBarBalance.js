import {StyleSheet, TouchableOpacity} from 'react-native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {CENTER, ICONS, SIZES} from '../../../../../constants';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import {useGlobaleCash} from '../../../../../../context-store/eCash';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import {useNavigation} from '@react-navigation/native';
import {
  LIGHTNINGAMOUNTBUFFER,
  LIQUIDAMOUTBUFFER,
} from '../../../../../constants/math';

export default function NavbarBalance() {
  const {liquidNodeInformation, nodeInformation, masterInfoObject} =
    useGlobalContextProvider();
  const {eCashBalance} = useGlobaleCash();
  const navigate = useNavigation();
  const maxSendingAmoount =
    nodeInformation.userBalance === 0
      ? liquidNodeInformation.userBalance > eCashBalance
        ? liquidNodeInformation.userBalance - LIQUIDAMOUTBUFFER
        : eCashBalance
      : nodeInformation.userBalance > liquidNodeInformation.userBalance
      ? nodeInformation.userBalance - LIGHTNINGAMOUNTBUFFER
      : liquidNodeInformation.userBalance - LIQUIDAMOUTBUFFER;

  return (
    <TouchableOpacity
      onPress={() => {
        navigate.navigate('InformationPopup', {
          textContent: `You might wonder why you can't send your full balance. Since you can only send from one source at a time, your available amount is the highest balance between eCash and Liquid (or Lightning). Blitz Wallet automatically rebalances your funds for a smoother experience.`,
          buttonText: 'I understand',
        });
      }}
      style={styles.container}>
      <ThemeImage
        styles={styles.walletIcon}
        lightModeIcon={ICONS.adminHomeWalletDark}
        darkModeIcon={ICONS.adminHomeWallet}
        lightsOutIcon={ICONS.adminHomeWallet_white}
      />
      <FormattedSatText
        containerStyles={{...CENTER}}
        neverHideBalance={true}
        styles={{...styles.headerText, includeFontPadding: false}}
        formattedBalance={formatBalanceAmount(
          numberConverter(
            maxSendingAmoount,
            masterInfoObject.userBalanceDenomination,
            nodeInformation,
            masterInfoObject.userBalanceDenomination != 'fiat' ? 0 : 2,
          ),
        )}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    ...CENTER,
  },

  walletIcon: {marginRight: 10, width: 23, height: 23},
  headerText: {
    fontSize: SIZES.large,
  },
});
