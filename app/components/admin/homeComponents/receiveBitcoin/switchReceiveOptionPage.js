import {useNavigation} from '@react-navigation/native';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {CENTER, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import {WINDOWWIDTH} from '../../../../constants/theme';
import handleBackPress from '../../../../hooks/handleBackPress';
import {useCallback, useEffect} from 'react';
import GetThemeColors from '../../../../hooks/themeColors';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import {useTranslation} from 'react-i18next';

export default function SwitchReceiveOptionPage(props) {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();
  const {backgroundOffset, backgroundColor} = GetThemeColors();
  const {t} = useTranslation();
  const setSelectedRecieveOption = props.route.params.setSelectedRecieveOption;
  const handleBackPressFunction = useCallback(() => {
    navigate.goBack();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);
  return (
    <GlobalThemeView>
      <View
        style={{
          flex: 1,
          width: WINDOWWIDTH,
          ...CENTER,
        }}>
        <TouchableOpacity
          style={{marginRight: 'auto'}}
          onPress={() => {
            navigate.goBack();
          }}>
          <ThemeImage
            darkModeIcon={ICONS.smallArrowLeft}
            lightModeIcon={ICONS.smallArrowLeft}
            lightsOutIcon={ICONS.arrow_small_left_white}
          />
        </TouchableOpacity>

        <View
          style={[
            styles.optionContainer,
            {
              backgroundColor: backgroundOffset,
            },
          ]}>
          <TouchableOpacity
            onPress={() => {
              handleClick('Lightning');
            }}>
            <View
              style={[
                styles.optionItemContainer,
                {
                  backgroundColor: backgroundColor,
                },
              ]}>
              <Image
                style={{width: 40, height: 65, marginRight: 10}}
                source={
                  theme ? ICONS.lightningBoltLight : ICONS.lightningBoltDark
                }
              />
              <ThemeText
                styles={{...styles.optionItemText}}
                content={`Lightning | ${t('wallet.switchOption.lightning')}`}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleClick('Bitcoin');
            }}>
            <View
              style={[
                styles.optionItemContainer,
                {
                  backgroundColor: backgroundColor,
                },
              ]}>
              <Image
                style={{width: 40, height: 40, marginRight: 10}}
                source={theme ? ICONS.chainLight : ICONS.chainDark}
              />
              <ThemeText
                styles={{...styles.optionItemText}}
                content={`On-chain | ${t('wallet.switchOption.bitcoin')}`}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleClick('Liquid');
            }}>
            <View
              style={[
                styles.optionItemContainer,
                {
                  backgroundColor: backgroundColor,
                  marginBottom: 0,
                },
              ]}>
              <Image
                style={{width: 40, height: 45, marginRight: 10}}
                source={theme ? ICONS.LiquidLight : ICONS.LiquidDark}
              />
              <ThemeText
                styles={{...styles.optionItemText}}
                content="Liquid Network"
              />
            </View>
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={() => {
              handleClick('Unified QR');
            }}>
            <View
              style={[
                styles.optionItemContainer,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeBackground
                    : COLORS.lightModeBackground,
                  marginBottom: 0,
                },
              ]}>
              <Image
                style={{width: 40, height: 40, marginRight: 10}}
                source={theme ? ICONS.qrCodeLight : ICONS.qrCodeDark}
              />

              <Text
                style={[
                  styles.optionItemText,
                  {
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}>
                Unified QR code | Bitcoin and Lightning address combined
              </Text>
            </View>
          </TouchableOpacity> */}
        </View>
      </View>
    </GlobalThemeView>
  );

  function handleClick(selectedOption) {
    setSelectedRecieveOption(prev => {
      return {...prev, selectedRecieveOption: selectedOption};
    });
    navigate.goBack();
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  optionContainer: {
    height: 'auto',
    width: '90%',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    ...CENTER,
    marginTop: 20,
  },
  icon: {width: 40, height: 40},
  optionItemContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 90,
  },
  optionItemText: {
    width: '80%',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },
});
