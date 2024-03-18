import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Text,
  ScrollView,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {getLocalStorageItem, retrieveData} from '../../../../functions';
import QRCode from 'react-native-qrcode-svg';

export default function MyContactProfilePage() {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();

  const [myNostrProfile, setMyNosterProfile] = useState({});

  useEffect(() => {
    (async () => {
      const savedProfile = await retrieveData('myNostrProfile');
      setMyNosterProfile(savedProfile);
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
    <View style={[styles.globalContainer, {backgroundColor: themeBackground}]}>
      <SafeAreaView style={{flex: 1}}>
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
        <View style={styles.innerContainer}>
          <Text style={[styles.nameText, {color: themeText}]}>
            {myNostrProfile.name || 'Anonymous'}
          </Text>
          <View
            style={[
              styles.qrContainer,
              {
                backgroundColor: themeBackgroundOffset,
              },
            ]}>
            <QRCode
              size={230}
              quietZone={10}
              value={'Genrating QR Code'}
              color={theme ? COLORS.lightModeText : COLORS.darkModeText}
              backgroundColor={
                theme ? COLORS.darkModeText : COLORS.lightModeText
              }
              logo={myNostrProfile.icon || ICONS.logoIcon}
              logoSize={30}
              logoMargin={8}
              logoBackgroundColor={COLORS.darkModeText}
              logoBorderRadius={20}
            />
          </View>
          <Text style={[styles.scanText, {color: themeText}]}>
            Scan to add me
          </Text>
          <Text style={[styles.scanText, {color: themeText, marginBottom: 40}]}>
            as a contact
          </Text>

          <Text style={[styles.bioHeaderText, {color: themeText}]}>Bio</Text>
          <View
            style={[
              styles.bioContainer,
              {backgroundColor: themeBackgroundOffset},
            ]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={[
                  styles.bioText,
                  {color: themeText, textDecorationColor: themeText},
                ]}>
                {myNostrProfile.bio || 'No bio set'}
              </Text>
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[styles.buttonContainer, {borderColor: themeText}]}>
            <Text style={[styles.buttonText, {color: themeText}]}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
  innerContainer: {
    flex: 1,
    width: '95%',
    alignItems: 'center',
    ...CENTER,
  },
  nameText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.xxLarge,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  qrContainer: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  scanText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.large,
    textAlign: 'center',
  },
  bioHeaderText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.xxLarge,
    marginBottom: 10,
  },
  bioContainer: {
    width: '80%',
    height: 100,
    borderRadius: 8,
    padding: 10,
  },
  bioText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    textDecorationLine: 'underline',
  },

  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 'auto',

    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
  },
});
