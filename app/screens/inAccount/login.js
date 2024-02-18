import {useContext, useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';

import {COLORS, FONT, SIZES} from '../../constants';
import PinPage from '../../components/admin/loginComponents/pinPage';
import HomeLogin from '../../components/admin/loginComponents/home';
import {useGlobalContextProvider} from '../../../context-store/context';

export default function AdminLogin({navigation, route}) {
  const [didUsePin, setDidUsePin] = useState(false);
  const fromBackground = route.params?.fromBackground;
  const {theme, setTheme} = useGlobalContextProvider();

  return (
    <View
      style={[
        styles.globalContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
        },
      ]}>
      <SafeAreaView style={styles.globalContainer}>
        {didUsePin && (
          <PinPage
            navigation={navigation}
            theme={theme}
            fromBackground={fromBackground}
          />
        )}
        {!didUsePin && (
          <HomeLogin
            navigation={navigation}
            theme={theme}
            setDidUsePin={setDidUsePin}
            fromBackground={fromBackground}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
});
