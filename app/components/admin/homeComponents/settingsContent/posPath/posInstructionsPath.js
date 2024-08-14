import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import {useGlobalContextProvider} from '../../../../../../context-store/context';

import {useNavigation} from '@react-navigation/native';
import {COLORS, FONT, SIZES, WINDOWWIDTH} from '../../../../../constants/theme';
import {backArrow, CENTER} from '../../../../../constants/styles';
import {ICONS} from '../../../../../constants';
import QRCode from 'react-native-qrcode-svg';
import CustomButton from '../../../../../functions/CustomElements/button';
import React, {useRef} from 'react';
import {copyToClipboard} from '../../../../../functions';

export default function POSInstructionsPath() {
  const {masterInfoObject} = useGlobalContextProvider();
  const navigate = useNavigation();

  return (
    <GlobalThemeView useStandardWidth={true} style={{flex: 1}}>
      <View style={styles.topbar}>
        <TouchableOpacity
          style={{position: 'absolute', top: 0, left: 0, zIndex: 1}}
          onPress={() => navigate.goBack()}>
          <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
        </TouchableOpacity>
        <ThemeText content={'Instructions'} styles={{...styles.topBarText}} />
      </View>
      <ThemeText styles={styles.headingText} content={'How to accept'} />
      <ThemeText styles={styles.headingText} content={'Bitcoin payments'} />

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          copyToClipboard(
            `blitz-wallet.com/pay/${masterInfoObject.posSettings.storeName}`,
            navigate,
          );
        }}
        style={styles.qrCodeContainer}>
        <View style={styles.qrCodeBorder}>
          <QRCode
            size={250}
            quietZone={15}
            value={`blitz-wallet.com/pay/${masterInfoObject.posSettings.storeName}`}
            color={COLORS.lightModeText}
            backgroundColor={COLORS.darkModeText}
            //   logo={ICONS.logoIcon}
            //   logoSize={60}
            //   logoMargin={7}
            //   logoBorderRadius={50}
            BackgroundColor={COLORS.darkModeText}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          copyToClipboard(
            `blitz-wallet.com/pay/${masterInfoObject.posSettings.storeName}`,
            navigate,
          );
        }}>
        <ThemeText
          styles={{textAlign: 'center', marginTop: 10}}
          content={`blitz-wallet.com/pay/${masterInfoObject.posSettings.storeName}`}
        />
      </TouchableOpacity>
      <View style={{marginTop: 'auto', marginBottom: 'auto'}}>
        <ThemeText
          styles={{fontSize: SIZES.small, textAlign: 'center'}}
          content={`1. Scan QR code with your camera`}
        />
        <ThemeText
          styles={{fontSize: SIZES.small, textAlign: 'center'}}
          content={`2. Click the 3 dots on the top right corner of the web-browser`}
        />
        <ThemeText
          styles={{fontSize: SIZES.small, textAlign: 'center'}}
          content={`1. Click "Add to home screen"`}
        />
        <ThemeText
          styles={{fontSize: SIZES.small, textAlign: 'center'}}
          content={`1. Done! Use the now saved app to accept payments`}
        />
        <ThemeText
          styles={{fontSize: SIZES.small, textAlign: 'center'}}
          content={`show the customer the QR code that appears`}
        />
      </View>
      {/* <CustomButton
          buttonStyles={{
            width: '65%',
            marginTop: 20,
            ...CENTER,
            backgroundColor: COLORS.primary,
          }}
          textStyles={{color: COLORS.darkModeText}}
          actionFunction={handleCapture}
          textContent={'Download screenshot'}
        /> */}
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 10,
  },

  topBarText: {
    width: '100%',
    fontSize: SIZES.xLarge,
    fontFamily: FONT.Title_Regular,
    textAlign: 'center',
  },

  headingText: {
    fontSize: SIZES.xLarge,
    textAlign: 'center',
    includeFontPadding: false,
  },
  qrCodeContainer: {
    width: 275,
    height: 275,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    ...CENTER,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeBorder: {
    width: 250,
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
