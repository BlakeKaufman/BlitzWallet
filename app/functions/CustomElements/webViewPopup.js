import {StyleSheet, TouchableOpacity, View} from 'react-native';
import GlobalThemeView from './globalThemeView';
import {WebView} from 'react-native-webview';
import {CENTER, ICONS} from '../../constants';
import ThemeImage from './themeImage';
import {WINDOWWIDTH} from '../../constants/theme';
import ThemeText from './textTheme';

export default function CustomWebView(props) {
  return (
    <GlobalThemeView styles={{paddingBottom: 0}}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            props.navigation.goBack();
          }}
          style={{marginRight: 'auto'}}>
          <ThemeImage
            lightModeIcon={ICONS.smallArrowLeft}
            darkModeIcon={ICONS.smallArrowLeft}
            lightsOutIcon={ICONS.arrow_small_left_white}
          />
        </TouchableOpacity>
        <ThemeText
          styles={styles.textStyles}
          content={props.route.params?.headerText}
        />
      </View>
      <WebView
        style={styles.container}
        source={{uri: props.route.params?.webViewURL}}
      />
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    width: WINDOWWIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    ...CENTER,
  },
  textStyles: {
    width: '100%',
    zIndex: -1,
    position: 'absolute',
    textAlign: 'center',
  },
});
