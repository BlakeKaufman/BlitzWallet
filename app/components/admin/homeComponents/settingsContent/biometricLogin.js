import {Alert, StyleSheet, Switch, Text, View} from 'react-native';
import {COLORS, FONT, SIZES} from '../../../../constants';
import {useEffect, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {
  getLocalStorageItem,
  handleLogin,
  hasHardware,
  hasSavedProfile,
  setLocalStorageItem,
} from '../../../../functions';

export default function BiometricLoginPage(props) {
  const [isFaceIDEnabled, setIsFaceIDEnabled] = useState(null);
  const navigate = useNavigation();

  useEffect(() => {
    (async () => {
      const userPereferance = await getLocalStorageItem(
        'userFaceIDPereferance',
      );
      const canUseFaceID = await hasHardware();
      if (canUseFaceID) {
        const hasProfile = await hasSavedProfile();

        if (hasProfile) {
          setIsFaceIDEnabled(
            JSON.parse(userPereferance) === null
              ? false
              : JSON.parse(userPereferance)
              ? true
              : false,
          );
        } else {
          Alert.alert(
            'Device does not have a Biometric profile',
            'Create one in settings to continue',
            [{text: 'Ok', onPress: () => navigate.goBack()}],
          );
        }
      } else {
        Alert.alert('Device does not support Biometric login', '', [
          {text: 'Ok', onPress: () => navigate.goBack()},
        ]);
      }
    })();
  }, []);

  if (isFaceIDEnabled === null) return;
  return (
    <View style={styles.globalContainer}>
      <View style={styles.innerContainer}>
        <View
          style={[
            styles.contentContainer,
            {
              backgroundColor: props.theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
            },
          ]}>
          <View style={styles.faceIDContainer}>
            <Text
              style={[
                styles.contentText,
                {
                  color: props.theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
                },
              ]}>
              Enable Biometric Login
            </Text>
            <Switch
              trackColor={{
                true: COLORS.primary,
              }}
              onChange={handleSwitch}
              value={isFaceIDEnabled}
            />
          </View>
        </View>
      </View>
    </View>
  );
  async function handleSwitch() {
    const didLogin = await handleLogin();
    if (didLogin) {
      setIsFaceIDEnabled(prev => !prev);
      await setLocalStorageItem(
        'userFaceIDPereferance',
        JSON.stringify(!isFaceIDEnabled),
      );
    } else {
      Alert.alert('Error, Try again.');
    }
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    alignItems: 'center',
  },
  innerContainer: {
    flex: 1,
    width: '90%',
    paddingTop: 50,
  },
  contentContainer: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
  },
  contentText: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.medium,
  },

  faceIDContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderContainer: {
    width: 70,
    height: 35,
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    justifyContent: 'center',
  },
  sliderBall: {
    height: 30,
    width: 30,
    borderRadius: 15,
    position: 'absolute',
    left: 0,
  },
});
