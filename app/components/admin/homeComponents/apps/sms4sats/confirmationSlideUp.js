import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useEffect} from 'react';
import handleBackPress from '../../../../../hooks/handleBackPress';
import {ThemeText} from '../../../../../functions/CustomElements';
import {
  formatBalanceAmount,
  getClipboardText,
  getQRImage,
  numberConverter,
} from '../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import SwipeButton from 'rn-swipe-button';
import {parsePhoneNumber} from 'libphonenumber-js';

export default function ConfirmSMSPayment(props) {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme, nodeInformation, masterInfoObject} = useGlobalContextProvider();
  const {areaCodeNum, phoneNumber, prices, page, setDidConfirmFunction} =
    props.route.params;

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  return (
    <TouchableWithoutFeedback onPress={() => navigate.goBack()}>
      <View style={{flex: 1}}>
        <View style={{marginTop: 'auto'}}>
          <View
            style={[
              styles.borderTop,
              {
                width: useWindowDimensions().width * 0.99,
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
                left: (useWindowDimensions().width * 0.01) / 2,
              },
            ]}></View>
          <View
            style={{
              height: useWindowDimensions().height * 0.5,
              width: '100%',
              backgroundColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,

              // borderTopColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
              // borderTopWidth: 10,

              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,

              // borderTopLeftRadius: 10,
              // borderTopRightRadius: 10,

              padding: 10,
              paddingBottom: insets.bottom,
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
            }}>
            <View
              style={[
                styles.topBar,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                },
              ]}></View>
            <ThemeText
              styles={{fontSize: SIZES.xLarge, textAlign: 'center'}}
              content={'Confirm number'}
            />
            <ThemeText
              styles={{
                fontSize: SIZES.large,
                textAlign: 'center',
              }}
              content={`${parsePhoneNumber(
                `${areaCodeNum}${phoneNumber}`,
              ).formatInternational()}`}
            />
            <ThemeText
              styles={{
                fontSize: SIZES.large,
                textAlign: 'center',
                marginTop: 'auto',
                marginBottom: 'auto',
              }}
              content={`Fee ${numberConverter(
                page === 'sendSMS' ? 1000 : prices[page],
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
                masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
              )} ${
                masterInfoObject.userBalanceDenomination === 'fiat'
                  ? nodeInformation.fiatStats.coin
                  : 'sats'
              }`}
            />
            <SwipeButton
              containerStyles={{
                width: '90%',
                maxWidth: 350,
                borderColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
                ...CENTER,
                marginBottom: 20,
              }}
              titleStyles={{fontWeight: 'bold', fontSize: SIZES.large}}
              swipeSuccessThreshold={100}
              onSwipeSuccess={() => {
                console.log('sucess');
                setDidConfirmFunction(true);
                navigate.goBack();
              }}
              railBackgroundColor={
                theme ? COLORS.lightModeBackground : COLORS.darkModeBackground
              }
              railBorderColor={
                theme ? COLORS.darkModeBackground : COLORS.lightModeBackground
              }
              height={55}
              railStyles={{
                backgroundColor: theme
                  ? COLORS.darkModeBackground
                  : COLORS.lightModeBackground,
                borderColor: theme
                  ? COLORS.darkModeBackground
                  : COLORS.lightModeBackground,
              }}
              thumbIconBackgroundColor={
                theme ? COLORS.darkModeBackground : COLORS.lightModeBackground
              }
              thumbIconBorderColor={
                theme ? COLORS.lightModeBackground : COLORS.lightModeBackground
              }
              titleColor={
                theme ? COLORS.darkModeBackground : COLORS.lightModeBackground
              }
              title="Slide to confirm"
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: 120,
    height: 8,
    marginTop: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  borderTop: {
    width: '100%',
    height: 60,
    position: 'absolute',
    top: -5,
    zIndex: -1,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  optionsContainer: {
    width: '100%',
    height: '100%',
  },
});
