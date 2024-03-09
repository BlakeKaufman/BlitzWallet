import {useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {
  Back_BTN,
  Image_header,
  Switch_Text,
  Continue_BTN,
} from '../../components/login';
import {Background, COLORS, ICONS} from '../../constants';
import {useTranslation} from 'react-i18next';

export default function DislaimerPage({navigation: {navigate}}) {
  const {t} = useTranslation();
  const [isEnabled, setIsEnabled] = useState([
    {for: 'top', isEnabled: false},
    {for: 'bottom', isEnabled: false},
  ]);

  const toggleSwitch = clicked => {
    setIsEnabled(previousState =>
      previousState.map(state => {
        if (state.for === clicked)
          return {...state, isEnabled: !state.isEnabled};
        else return state;
      }),
    );
  };

  return (
    <View style={Background}>
      <SafeAreaView style={[styles.globalContainer]}>
        <Back_BTN navigation={navigate} destination="Home" />
        <View style={styles.contentContainer}>
          <Image_header
            text={t('createAccount.disclaimerPage.imgHeader')}
            image={ICONS.walletIcon}
          />
          <Switch_Text
            for="top"
            text={t('createAccount.disclaimerPage.switchText1')}
            isEnabled={isEnabled}
            toggleSwitch={toggleSwitch}
          />

          <Switch_Text
            for="bottom"
            text={t('createAccount.disclaimerPage.switchText2')}
            isEnabled={isEnabled}
            toggleSwitch={toggleSwitch}
          />
          <Continue_BTN
            destination="StartKeyGeneration"
            continue={isEnabled}
            text={t('createAccount.disclaimerPage.continueBTN')}
            for="disclaimer"
            navigation={navigate}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    paddingBottom: 15,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});
