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

import SwipeButton from 'rn-swipe-button';

import handleBackPress from '../../../../../../hooks/handleBackPress';
import {ThemeText} from '../../../../../../functions/CustomElements';
import {
  formatBalanceAmount,
  numberConverter,
} from '../../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../../context-store/context';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../../../constants';
import FormattedSatText from '../../../../../../functions/CustomElements/satTextDisplay';
import GetThemeColors from '../../../../../../hooks/themeColors';

export default function ConfirmVPNPage(props) {
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme, nodeInformation, masterInfoObject} = useGlobalContextProvider();
  const {duratoin, country, createVPN, price} = props.route.params;
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();

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
                backgroundColor: backgroundOffset,
                left: (useWindowDimensions().width * 0.01) / 2,
              },
            ]}></View>
          <View
            style={{
              height: useWindowDimensions().height * 0.5,
              width: '100%',
              backgroundColor: backgroundColor,

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
                  backgroundColor: backgroundOffset,
                },
              ]}></View>
            <ThemeText
              styles={{fontSize: SIZES.large, textAlign: 'center'}}
              content={'Confirm Country'}
            />
            <ThemeText
              styles={{
                fontSize: SIZES.large,
                textAlign: 'center',
                marginBottom: 10,
              }}
              content={`${country}`}
            />
            <ThemeText
              styles={{fontSize: SIZES.large}}
              content={`Duration: 1 ${duratoin}`}
            />
            <FormattedSatText
              neverHideBalance={true}
              iconHeight={15}
              iconWidth={15}
              containerStyles={{marginBottom: 'auto'}}
              styles={{
                fontSize: SIZES.large,
                textAlign: 'center',
              }}
              frontText={'Price: '}
              formattedBalance={formatBalanceAmount(
                numberConverter(
                  price,
                  masterInfoObject.userBalanceDenomination,
                  nodeInformation,
                  masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
                ),
              )}
            />

            <SwipeButton
              containerStyles={{
                width: '90%',
                maxWidth: 350,
                borderColor: textColor,
                ...CENTER,
                marginBottom: 20,
              }}
              titleStyles={{fontWeight: 'bold', fontSize: SIZES.large}}
              swipeSuccessThreshold={100}
              onSwipeSuccess={() => {
                navigate.goBack();
                setTimeout(() => {
                  createVPN();
                }, 500);
              }}
              railBackgroundColor={
                theme ? COLORS.lightModeBackground : backgroundColor
              }
              railBorderColor={
                theme ? backgroundColor : COLORS.lightModeBackground
              }
              height={55}
              railStyles={{
                backgroundColor: theme
                  ? backgroundColor
                  : COLORS.lightModeBackground,
                borderColor: theme
                  ? backgroundColor
                  : COLORS.lightModeBackground,
              }}
              thumbIconBackgroundColor={
                theme ? backgroundColor : COLORS.lightModeBackground
              }
              thumbIconBorderColor={
                theme ? backgroundColor : COLORS.lightModeBackground
              }
              titleColor={theme ? backgroundColor : COLORS.lightModeBackground}
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
