import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {CENTER, COLORS, FONT, SIZES} from '../../constants';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {APPLIST} from '../../components/admin/homeComponents/apps/appList';
import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import handleBackPress from '../../hooks/handleBackPress';
import {useEffect} from 'react';

export default function AppStore({navigation}) {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();
  const isFocused = useIsFocused();

  function handleBackPressFunction() {
    navigation.navigate('Home');
    return true;
  }
  useEffect(() => {
    if (!isFocused) return;
    console.log('RUNNIN IN APP INDES USE EFFECT');
    handleBackPress(handleBackPressFunction);
  }, [isFocused]);

  const appElements = APPLIST.map((app, id) => {
    return (
      <TouchableOpacity
        key={id}
        onPress={() => {
          navigate.navigate('AppStorePageIndex', {page: app.pageName});
        }}
        style={styles.appRowContainer}>
        <View
          style={[
            styles.appIcon,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
            },
          ]}>
          <Image
            // resizeMethod="scale"
            resizeMode="contain"
            style={{width: '80%', aspectRatio: 1, height: undefined}}
            source={theme ? app.iconLight : app.iconDark}
          />
        </View>
        <View>
          <ThemeText content={app.name} styles={{...styles.appTitle}} />
          <ThemeText
            content={app.description}
            styles={{...styles.appDescription}}
          />
        </View>
      </TouchableOpacity>
    );
  });

  return (
    <GlobalThemeView>
      <View style={styles.topBar}>
        <ThemeText content={'All apps'} styles={{...styles.headerText}} />
      </View>
      <View style={{flex: 1, width: '90%', ...CENTER}}>
        <ScrollView>{appElements}</ScrollView>
      </View>
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    // backgroundColor: 'black',
    ...CENTER,
  },
  backButton: {
    width: 20,
    height: 20,
  },

  headerText: {fontFamily: FONT.Title_Bold, fontSize: SIZES.large},

  appTitle: {
    fontSize: SIZES.large,
    fontWeight: 500,
  },
  appDescription: {
    fontSize: SIZES.small,
    flexWrap: 'wrap',
  },

  appRowContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',

    marginVertical: 10,
  },
  appIcon: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderRadius: 8,
  },
});
