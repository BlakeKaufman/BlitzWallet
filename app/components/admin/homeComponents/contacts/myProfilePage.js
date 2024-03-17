import {StyleSheet, View, TouchableOpacity, Image} from 'react-native';
import {CENTER, COLORS, ICONS} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {getLocalStorageItem} from '../../../../functions';

export default function MyContactProfilePage() {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();

  const [myNostrProfile, setMyNosterProfile] = useState({});

  useEffect(() => {
    (async () => {
      const savedProfile = await getLocalStorageItem('myNostrProfile');
    })();
  }, []);

  const themeBackground = theme
    ? COLORS.darkModeBackground
    : COLORS.lightModeBackground;
  const themeText = theme ? COLORS.darkModeText : COLORS.lightModeText;
  const themeBackgroundOffset = theme
    ? COLORS.darkModeBackgroundOffset
    : COLORS.lightModeBackgroundOffset;
  return (
    <View style={styles.globalContainer}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            navigate.goBack();
          }}>
          <Image
            style={{
              width: 30,
              height: 30,
              transform: [{translateX: -7}],
            }}
            source={ICONS.smallArrowLeft}
          />
        </TouchableOpacity>
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
    marginBottom: 15,
    paddingHorizontal: 5,
    // backgroundColor: 'black',
    ...CENTER,
  },
  backButton: {
    width: 20,
    height: 20,
  },
});
