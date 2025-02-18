import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import {useAppStatus} from '../../../../../../context-store/appStatus';

export default function AccountInformationPage(props) {
  const navigate = useNavigation();
  const {minMaxLiquidSwapAmounts} = useAppStatus();
  const {setTransferInfo, transferType, userBalanceInformation} =
    props.route.params;
  console.log(userBalanceInformation);
  const rowElements = ['Lightning', 'Bank', 'eCash'].map(item => {
    if (
      item === 'Lightning' &&
      userBalanceInformation.lightningBalance < minMaxLiquidSwapAmounts.min
    )
      return null;
    if (
      (item === 'Bank' &&
        userBalanceInformation.liquidBalance < minMaxLiquidSwapAmounts.min) ||
      userBalanceInformation.lightningInboundAmount <
        minMaxLiquidSwapAmounts.min
    )
      return null;
    if (
      item === 'eCash' &&
      userBalanceInformation.ecashBalance < minMaxLiquidSwapAmounts.min
    )
      return null;

    return (
      <View key={item} style={styles.transferAccountRow}>
        <View>
          <ThemeText content={item} />
        </View>
        <TouchableOpacity
          onPress={() => {
            setTransferInfo({
              from: item,
              to:
                item === 'Lightning' || item === 'eCash' ? 'Bank' : 'Lightning',
            });
            navigate.goBack();
          }}
          style={styles.chooseAccountBTN}>
          <FormattedSatText
            balance={Math.round(
              item === 'Lightning'
                ? userBalanceInformation.lightningBalance
                : item === 'Bank'
                ? userBalanceInformation.liquidBalance
                : userBalanceInformation.ecashBalance,
            )}
          />
          <ThemeImage
            styles={styles.chooseAccountImage}
            lightModeIcon={ICONS.leftCheveronIcon}
            darkModeIcon={ICONS.leftCheveronIcon}
            lightsOutIcon={ICONS.left_cheveron_white}
          />
        </TouchableOpacity>
      </View>
    );
  });
  return (
    <GlobalThemeView useStandardWidth={true}>
      <View style={styles.topbar}>
        <TouchableOpacity
          style={{position: 'absolute', top: 0, left: 0, zIndex: 1}}
          onPress={() => {
            navigate.goBack();
          }}>
          <ThemeImage
            lightsOutIcon={ICONS.arrow_small_left_white}
            darkModeIcon={ICONS.smallArrowLeft}
            lightModeIcon={ICONS.smallArrowLeft}
          />
        </TouchableOpacity>
        <ThemeText
          CustomEllipsizeMode={'tail'}
          CustomNumberOfLines={1}
          content={'Accounts'}
          styles={{...styles.topBarText}}
        />
      </View>
      <View style={{flex: 1, width: '90%', ...CENTER}}>{rowElements}</View>
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarText: {
    fontSize: SIZES.xLarge,
    width: '100%',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.halfModalBackgroundColor,
  },
  absolute: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  contentContainer: {
    width: '90%',
    backgroundColor: COLORS.darkModeText,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  transferAccountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    alignItems: 'center',
  },
  chooseAccountBTN: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chooseAccountImage: {height: 20, width: 20, transform: [{rotate: '180deg'}]},
});
