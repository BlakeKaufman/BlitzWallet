import {StyleSheet, View, TouchableOpacity} from 'react-native';
import {CENTER, ICONS} from '../../../constants';
import {useNavigation} from '@react-navigation/native';
import {WINDOWWIDTH} from '../../../constants/theme';
import ThemeImage from '../../../functions/CustomElements/themeImage';
import {useGlobalThemeContext} from '../../../../context-store/theme';

export default function NavBar() {
  console.log('NAV BAR PAGE');

  const navigate = useNavigation();
  const {theme, toggleTheme} = useGlobalThemeContext();

  return (
    <View style={[styles.topBar]}>
      <TouchableOpacity
        onPress={() => {
          toggleTheme(!theme);
        }}
        activeOpacity={0.5}>
        <ThemeImage
          darkModeIcon={ICONS.lightMode}
          lightsOutIcon={ICONS.lightModeWhite}
          lightModeIcon={ICONS.darkMode}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          navigate.navigate('SettingsHome');
        }}
        activeOpacity={0.5}>
        <ThemeImage
          styles={{marginLeft: 10}}
          darkModeIcon={ICONS.settingsIcon}
          lightsOutIcon={ICONS.settingsWhite}
          lightModeIcon={ICONS.settingsIcon}
        />
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
});
