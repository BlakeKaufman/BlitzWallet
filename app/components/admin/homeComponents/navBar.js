import {StyleSheet, View, TouchableOpacity, Image} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SHADOWS, SIZES} from '../../../constants';

import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../context-store/context';
import {WINDOWWIDTH} from '../../../constants/theme';
import Icon from '../../../functions/CustomElements/Icon';
import ThemeImage from '../../../functions/CustomElements/themeImage';

export default function NavBar() {
  console.log('NAV BAR PAGE');

  const navigate = useNavigation();
  const {nodeInformation, theme, toggleTheme} = useGlobalContextProvider();

  return (
    <View style={[styles.topBar]}>
      <TouchableOpacity
        onPress={() => {
          toggleTheme(!theme);
        }}
        activeOpacity={0.5}>
        {/* <Icon
          width={styles.imgIcon.width}
          height={styles.imgIcon.height}
          name={theme ? 'sun' : 'moon'}
        /> */}
        <ThemeImage
          darkModeIcon={ICONS.lightMode}
          lightsOutIcon={ICONS.lightModeWhite}
          lightModeIcon={ICONS.darkMode}
        />
      </TouchableOpacity>
      {/* <TouchableOpacity
        onPress={() => navigate.navigate('ConnectionToNode')}
        style={{
          ...styles.connectionToNodeIcon,
          backgroundColor: nodeInformation.didConnectToNode
            ? COLORS.connectedNodeColor
            : COLORS.notConnectedNodeColor,
          marginLeft: 'auto',
          // marginRight: 10,
        }}></TouchableOpacity> */}

      <TouchableOpacity
        onPress={() => {
          navigate.navigate('SettingsHome');
        }}
        activeOpacity={0.5}>
        {/* <Icon
          width={styles.imgIcon.width}
          height={styles.imgIcon.height}
          name={'settings'}
        /> */}
        <ThemeImage
          styles={{marginLeft: 10}}
          darkModeIcon={ICONS.settingsIcon}
          lightsOutIcon={ICONS.settingsWhite}
          lightModeIcon={ICONS.settingsIcon}
        />
        {/* <Image style={styles.imgIcon} source={ICONS.settingsIcon} /> */}
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  topBar: {
    width: WINDOWWIDTH,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...CENTER,
    marginBottom: 40,
  },

  connectionToNodeIcon: {
    width: 17.5,
    height: 17.5,
    borderRadius: 17.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
