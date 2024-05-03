import {
  Animated,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {FONT, SIZES, CENTER, ICONS} from '../../../../constants';
import {useEffect, useRef} from 'react';
import {useGlobalContextProvider} from '../../../../../context-store/context';

export default function NavBar(props) {
  const {theme} = useGlobalContextProvider();
  const lightning = useRef(new Animated.Value(0)).current;
  const liquid = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeOut();
    if (props.selectedRecieveOption === 'lightning') fadeIn('lightning');
    else fadeIn('liquid');
    Keyboard.dismiss();
  }, [props.selectedRecieveOption]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => props.setSelectedRecieveOption('lightning')}>
        <Animated.Image
          style={[styles.navIcon, {transform: [{scale: lightning}]}]}
          source={ICONS.lightningIcon}
        />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => props.setSelectedRecieveOption('liquid')}>
        <Animated.Image
          style={[styles.navIcon, {transform: [{scale: liquid}], width: 45}]}
          source={theme ? ICONS.LiquidLight : ICONS.LiquidDark}
        />
      </TouchableOpacity>
    </View>
  );
  function fadeIn(type) {
    const animationType = type === 'lightning' ? lightning : liquid;
    Animated.timing(animationType, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }
  function fadeOut() {
    Animated.timing(liquid, {
      toValue: 0.5,
      duration: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(lightning, {
      toValue: 0.5,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }
}

const styles = StyleSheet.create({
  container: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'center',
    ...CENTER,
    marginBottom: 20,
  },

  navIcon: {
    width: 50,
    height: 50,
    marginRight: 5,
    marginLeft: 5,
  },
});
