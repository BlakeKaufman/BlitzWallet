import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useGlobalContextProvider} from '../../../context-store/context';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../constants';
import {useNavigation} from '@react-navigation/native';
import {APPLIST} from '../../components/admin/homeComponents/apps/appList';
import {useEffect, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA} from '../../constants/styles';

export default function AppStore({navigation}) {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();

  const themeText = theme ? COLORS.darkModeText : COLORS.lightModeText;

  const appElements = APPLIST.map((app, id) => {
    return (
      <View
        key={id}
        style={{
          flex: 1,
          width: '90%',
          ...CENTER,
          marginVertical: 10,
        }}>
        <TouchableOpacity
          onPress={() => {
            navigate.navigate('AppStorePageIndex', {page: app.pageName});
          }}
          style={{flex: 1, flexDirection: 'row', alignItems: 'flex-start'}}>
          <View
            style={{
              width: 60,
              height: 60,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              borderRadius: 8,
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
            }}>
            <Image
              // resizeMethod="scale"
              resizeMode="contain"
              style={{width: '80%', aspectRatio: 1, height: undefined}}
              source={theme ? app.iconLight : app.iconDark}
            />
          </View>
          <View>
            <Text style={[styles.appTitle, {color: themeText}]}>
              {app.name}
            </Text>
            <Text style={[styles.appDescription, {color: themeText}]}>
              {app.description}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme
          ? COLORS.darkModeBackground
          : COLORS.lightModeBackground,
        paddingTop: insets.top === 0 ? ANDROIDSAFEAREA : insets.top,
        paddingBottom: insets.bottom === 0 ? ANDROIDSAFEAREA : insets.bottom,
      }}>
      <View style={styles.topBar}>
        <Text
          style={[
            styles.headerText,
            {
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              // transform: [{translateX: -3.5}],
            },
          ]}>
          All apps
        </Text>
        {/* <TouchableOpacity
            onPress={() => {
              navigation.openDrawer();
            }}>
            <Image style={styles.backButton} source={ICONS.drawerList} />
          </TouchableOpacity> */}
      </View>
      <View style={{flex: 1}}>
        <ScrollView>{appElements}</ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  topBar: {
    width: '95%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingHorizontal: 5,
    paddingVertical: 15,
    // backgroundColor: 'black',
    ...CENTER,
  },
  backButton: {
    width: 20,
    height: 20,
  },

  headerText: {fontFamily: FONT.Title_Bold, fontSize: SIZES.large},

  appTitle: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,

    fontWeight: 500,
  },
  appDescription: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.small,
  },
});
