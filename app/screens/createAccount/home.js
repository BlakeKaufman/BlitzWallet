import React, {useEffect, useState} from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';

import {
  COLORS,
  FONT,
  ICONS,
  SIZES,
  BTN,
  Background,
  CENTER,
} from '../../constants';
import {useTranslation} from 'react-i18next';
import {generateMnemnoic, storeData} from '../../functions';
import {useGlobalContextProvider} from '../../../context-store/context';
import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import CustomButton from '../../functions/CustomElements/button';
import {WINDOWWIDTH} from '../../constants/theme';

export default function CreateAccountHome({navigation: {navigate}}) {
  const {t} = useTranslation();
  const {setContactsPrivateKey} = useGlobalContextProvider();
  useEffect(() => {
    try {
      generateMnemnoic(setContactsPrivateKey);
    } catch {
      console.log(err);
    }
  }, []);
  return (
    <GlobalThemeView>
      <View style={styles.container}>
        <ThemeText styles={styles.blitz} content={'Blitz'} />

        <CustomButton
          buttonStyles={{
            width: '80%',
            marginBottom: 20,
            backgroundColor: COLORS.primary,
          }}
          textStyles={{...styles.buttonText, color: COLORS.darkModeText}}
          textContent={t('createAccount.homePage.buttons.button2')}
          actionFunction={() => navigate('DisclaimerPage')}
        />
        <CustomButton
          buttonStyles={{
            width: '80%',

            marginBottom: 20,
          }}
          textStyles={{...styles.buttonText, color: COLORS.lightModeText}}
          textContent={t('createAccount.homePage.buttons.button1')}
          actionFunction={() => navigate('RestoreWallet')}
        />
        <CustomButton
          buttonStyles={{width: '80%', backgroundColor: 'transparent'}}
          textStyles={{...styles.buttonText, color: COLORS.lightModeText}}
          textContent={t('createAccount.homePage.buttons.button3')}
          actionFunction={() => navigate('RedeemGiftScreen')}
        />

        <ThemeText
          styles={{...styles.disclamer_text}}
          content={t('createAccount.homePage.subTitle')}
        />
      </View>
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: WINDOWWIDTH,

    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...CENTER,
  },
  blitz: {
    fontSize: 80,
    fontStyle: 'italic',
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 30,
    marginTop: 'auto',
    includeFontPadding: false,
  },

  buttonText: {
    fontSize: SIZES.large,
  },

  disclamer_text: {
    marginTop: 'auto',
    fontSize: SIZES.small,
  },
});
