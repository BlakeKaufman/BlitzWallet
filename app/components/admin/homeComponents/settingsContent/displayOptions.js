import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import {ThemeText} from '../../../../functions/CustomElements';

import {useEffect, useRef, useState} from 'react';
import Icon from '../../../../functions/CustomElements/Icon';

import CustomToggleSwitch from '../../../../functions/CustomElements/switch';
import {Slider} from '@miblanchard/react-native-slider';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import GetThemeColors from '../../../../hooks/themeColors';
import handleDBStateChange from '../../../../functions/handleDBStateChange';

export default function DisplayOptions() {
  const {
    theme,
    toggleMasterInfoObject,
    setMasterInfoObject,
    masterInfoObject,
    nodeInformation,
    darkModeType,
    toggleDarkModeType,
  } = useGlobalContextProvider();
  const [selectedCurrencyInfo, setSelectedCountryInfo] = useState(null);
  const {backgroundOffset} = GetThemeColors();
  const currentCurrency = masterInfoObject?.fiatCurrency;
  const fiatCurrenciesList = masterInfoObject.fiatCurrenciesList;
  const saveTimeoutRef = useRef(null);

  const sliderValue = masterInfoObject.homepageTxPreferance;

  const steps = [15, 20, 25, 30, 35, 40];
  const windowDimensions = useWindowDimensions();

  useEffect(() => {
    const [selectedCurrency] = fiatCurrenciesList?.filter(
      item => item.id === currentCurrency,
    );
    setSelectedCountryInfo(selectedCurrency);
  }, [fiatCurrenciesList, currentCurrency]);

  return (
    <ScrollView
      contentContainerStyle={{alignItems: 'center'}}
      style={styles.innerContainer}>
      <ThemeText styles={{...styles.infoHeaders}} content={'Dark Mode'} />
      <TouchableOpacity
        onPress={() => {
          if (darkModeType) return;
          toggleDarkModeType(!darkModeType);
        }}
        style={[
          styles.contentContainer,
          {
            // backgroundColor: theme
            //   ? COLORS.darkModeBackgroundOffset
            //   : COLORS.darkModeText,
            minHeight: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            paddingHorizontal: 0,
          },
        ]}>
        <ThemeText content={`Lights out`} />
        <View
          style={{
            height: 30,
            width: 30,
            backgroundColor: darkModeType
              ? theme
                ? backgroundOffset
                : COLORS.primary
              : 'transparent',
            borderWidth: darkModeType ? 0 : 2,
            borderColor: theme ? backgroundOffset : COLORS.white,
            borderRadius: 15,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {darkModeType && (
            <Icon
              width={15}
              height={15}
              color={COLORS.darkModeText}
              name={'expandedTxCheck'}
            />
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          if (!darkModeType) return;
          toggleDarkModeType(!darkModeType);
        }}
        style={[
          styles.contentContainer,
          {
            // backgroundColor: theme
            //   ? COLORS.darkModeBackgroundOffset
            //   : COLORS.darkModeText,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
            paddingHorizontal: 0,
            minHeight: 0,
          },
        ]}>
        <ThemeText content={`Dim`} />
        <View
          style={{
            height: 30,
            width: 30,
            backgroundColor: !darkModeType
              ? theme
                ? backgroundOffset
                : COLORS.primary
              : 'transparent',
            borderColor: theme ? backgroundOffset : COLORS.white,
            borderWidth: !darkModeType ? 0 : 2,
            borderRadius: 15,
            alignItems: 'center',

            justifyContent: 'center',
          }}>
          {!darkModeType && (
            <Icon
              width={15}
              height={15}
              color={COLORS.darkModeText}
              name={'expandedTxCheck'}
            />
          )}
        </View>
      </TouchableOpacity>
      <ThemeText
        styles={{...styles.infoHeaders}}
        content={'Balance Denomination'}
      />
      <View
        style={[
          styles.contentContainer,
          {
            backgroundColor: theme ? backgroundOffset : COLORS.darkModeText,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
            paddingVertical: 10,
          },
        ]}>
        <ThemeText content={'Current denomination'} />
        <TouchableOpacity
          onPress={() => {
            if (masterInfoObject.userBalanceDenomination === 'sats')
              handleDBStateChange(
                {userBalanceDenomination: 'fiat'},
                setMasterInfoObject,
                toggleMasterInfoObject,
                saveTimeoutRef,
              );
            else if (masterInfoObject.userBalanceDenomination === 'fiat')
              handleDBStateChange(
                {userBalanceDenomination: 'hidden'},
                setMasterInfoObject,
                toggleMasterInfoObject,
                saveTimeoutRef,
              );
            else
              handleDBStateChange(
                {userBalanceDenomination: 'sats'},
                setMasterInfoObject,
                toggleMasterInfoObject,
                saveTimeoutRef,
              );
          }}
          style={{
            height: 40,
            width: 40,
            backgroundColor: theme
              ? COLORS.darkModeText
              : COLORS.lightModeBackground,
            borderRadius: 8,
            alignItems: 'center',

            justifyContent: 'center',
          }}>
          {masterInfoObject.userBalanceDenomination === 'sats' ? (
            <Icon
              color={
                theme && darkModeType
                  ? COLORS.lightsOutBackground
                  : COLORS.primary
              }
              width={18}
              height={18}
              name={'bitcoinB'}
            />
          ) : masterInfoObject.userBalanceDenomination === 'fiat' ? (
            <ThemeText
              styles={{
                color:
                  theme && darkModeType
                    ? COLORS.lightsOutBackground
                    : COLORS.primary,
                includeFontPadding: false,
                fontSize: SIZES.large,
              }}
              content={selectedCurrencyInfo?.info?.symbol.grapheme}
            />
          ) : (
            <ThemeText
              styles={{
                color:
                  theme && darkModeType
                    ? COLORS.lightsOutBackground
                    : COLORS.primary,
                includeFontPadding: false,
                fontSize: SIZES.large,
              }}
              content={'*'}
            />
          )}
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.contentContainer,
          {
            backgroundColor: theme ? backgroundOffset : COLORS.darkModeText,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
            paddingVertical: 10,
          },
        ]}>
        <ThemeText content={'How to display sats'} />
        <TouchableOpacity
          onPress={() => {
            if (masterInfoObject.satDisplay === 'symbol') return;
            toggleMasterInfoObject({satDisplay: 'symbol'});
          }}
          style={{
            height: 40,

            width: 40,
            backgroundColor:
              masterInfoObject.satDisplay === 'symbol'
                ? theme && darkModeType
                  ? COLORS.lightsOutBackground
                  : COLORS.primary
                : theme
                ? COLORS.darkModeText
                : COLORS.lightModeBackground,
            borderRadius: 8,
            alignItems: 'center',

            justifyContent: 'center',
            marginLeft: 'auto',
            marginRight: 10,
          }}>
          <Icon
            color={
              masterInfoObject.satDisplay === 'symbol'
                ? COLORS.darkModeText
                : theme && darkModeType
                ? COLORS.lightsOutBackground
                : COLORS.primary
            }
            width={18}
            height={18}
            name={'bitcoinB'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (masterInfoObject.satDisplay === 'word') return;
            toggleMasterInfoObject({satDisplay: 'word'});
          }}
          style={{
            height: 40,
            width: 'auto',
            backgroundColor:
              masterInfoObject.satDisplay === 'word'
                ? theme && darkModeType
                  ? COLORS.lightsOutBackground
                  : COLORS.primary
                : theme
                ? COLORS.darkModeText
                : COLORS.lightModeBackground,
            borderRadius: 8,
            alignItems: 'center',

            justifyContent: 'center',
          }}>
          <ThemeText
            styles={{
              color:
                masterInfoObject.satDisplay === 'word'
                  ? COLORS.darkModeText
                  : theme && darkModeType
                  ? COLORS.lightsOutBackground
                  : COLORS.primary,
              includeFontPadding: false,
              fontSize: SIZES.medium,
              paddingHorizontal: 10,
            }}
            content={'Sats'}
          />
        </TouchableOpacity>
      </View>
      <ThemeText content={'Example'} />
      <FormattedSatText
        neverHideBalance={true}
        iconHeight={15}
        iconWidth={15}
        formattedBalance={formatBalanceAmount(
          numberConverter(
            50,
            masterInfoObject.userBalanceDenomination,
            nodeInformation,
            masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
          ),
        )}
      />

      <ThemeText styles={{...styles.infoHeaders}} content={'Home Screen'} />
      <View
        style={[
          styles.contentContainer,
          {
            backgroundColor: theme ? backgroundOffset : COLORS.darkModeText,
            flexDirection: 'row',
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          },
        ]}>
        <ThemeText content={`Slide for camera`} />
        <CustomToggleSwitch page={'displayOptions'} />
      </View>
      <ThemeText
        styles={{
          ...styles.infoHeaders,
          width: windowDimensions.width * 0.95 * 0.9 * 0.9,
        }}
        content={'Displayed Transactions'}
      />
      <View style={styles.container}>
        <View style={styles.labelsContainer}>
          {steps.map(value => (
            <ThemeText key={value} content={value} />
          ))}
        </View>
        <Slider
          trackStyle={{
            width: windowDimensions.width * 0.95 * 0.9 * 0.9,
            backgroundColor: theme ? backgroundOffset : COLORS.darkModeText,
            height: 10,
            borderRadius: 20,
          }}
          onSlidingComplete={e => {
            const [num] = e;
            toggleMasterInfoObject({homepageTxPreferance: num});
          }}
          value={sliderValue}
          minimumValue={15}
          maximumValue={40}
          step={5}
          thumbStyle={{
            backgroundColor: COLORS.darkModeText,
            width: 25,
            height: 25,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
          }}
          maximumTrackTintColor={theme ? backgroundOffset : COLORS.darkModeText}
          minimumTrackTintColor={theme ? backgroundOffset : COLORS.darkModeText}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    marginTop: 25,

    width: '90%',
    ...CENTER,
  },
  infoHeaders: {
    width: '100%',
    marginBottom: 10,
  },
  contentContainer: {
    minHeight: 60,
    width: '100%',
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  homeScreenTxOptionContainer: {
    width: '100%',
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },

  container: {
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: SIZES.medium,
    color: '#000',
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 20,
    transform: [{scaleY: 2}],
  },
  imgIcon: {
    width: 30,
    height: 30,
  },
});
