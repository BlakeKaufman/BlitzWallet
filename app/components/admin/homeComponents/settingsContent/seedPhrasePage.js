import {Animated, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {KeyContainer} from '../../../login';
import {retrieveData} from '../../../../functions';
import {useEffect, useRef, useState} from 'react';
import {COLORS, FONT, SIZES, SHADOWS} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';

export default function SeedPhrasePage() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isInitialRender = useRef(true);
  const [mnemonic, setMnemonic] = useState([]);
  const [showSeed, setShowSeed] = useState(false);
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    if (showSeed) {
      (async () => {
        const mnemonic = await retrieveData('mnemonic');
        const sanitizedMnemonic = mnemonic.split(' ').filter(key => {
          return key && true;
        });
        setMnemonic(sanitizedMnemonic);
        fadeout();
      })();
    }
  }, [showSeed]);

  return (
    <View style={styles.globalContainer}>
      <View style={styles.container}>
        <Text
          style={[
            styles.headerPhrase,
            {
              marginBottom: 15,
              fontSize: SIZES.xLarge,
              textAlign: 'center',
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          Keep this phrase in a secure and safe place
        </Text>
        <Text
          style={[
            styles.headerPhrase,
            {marginBottom: 50, fontSize: SIZES.medium, color: COLORS.cancelRed},
          ]}>
          Do not share it with anyone
        </Text>
        <KeyContainer keys={mnemonic} />
      </View>

      <Animated.View
        style={[
          styles.confirmPopup,
          {
            transform: [{translateY: fadeAnim}],
            backgroundColor: theme
              ? COLORS.darkModeBackground
              : COLORS.lightModeBackground,
          },
        ]}>
        <View style={styles.confirmPopupInnerContainer}>
          <Text
            style={[
              styles.confirmPopupTitle,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            Are you sure you want to show your recovery phrase?
          </Text>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 50,
              width: '90%',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              style={[styles.confirmBTN, {backgroundColor: COLORS.primary}]}
              onPress={() => setShowSeed(true)}>
              <Text style={styles.confirmBTNText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigate.goBack()}
              style={[styles.confirmBTN, {backgroundColor: COLORS.cancelRed}]}>
              <Text style={styles.confirmBTNText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );

  function fadeout() {
    Animated.timing(fadeAnim, {
      toValue: 900,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 'auto',
    marginLeft: 'auto',
  },

  headerPhrase: {
    fontFamily: FONT.Title_Regular,
  },

  confirmPopup: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  confirmPopupInnerContainer: {
    width: '90%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPopupTitle: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.large,
    textAlign: 'center',
  },
  confirmBTN: {
    width: 150,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    ...SHADOWS.small,
  },
  confirmBTNText: {
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.medium,
    color: 'white',
  },
});
