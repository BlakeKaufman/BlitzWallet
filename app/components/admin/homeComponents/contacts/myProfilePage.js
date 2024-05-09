import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Text,
  ScrollView,
  TextInput,
  Share,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';

import {btoa} from 'react-native-quick-base64';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA} from '../../../../constants/styles';

export default function MyContactProfilePage() {
  const {theme, masterInfoObject} = useGlobalContextProvider();
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();

  const myContact = masterInfoObject.contacts.myProfile;

  const themeBackground = theme
    ? COLORS.darkModeBackground
    : COLORS.lightModeBackground;
  const themeText = theme ? COLORS.darkModeText : COLORS.lightModeText;
  const themeBackgroundOffset = theme
    ? COLORS.darkModeBackgroundOffset
    : COLORS.lightModeBackgroundOffset;
  return (
    <View style={[styles.globalContainer, {backgroundColor: themeBackground}]}>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top === 0 ? ANDROIDSAFEAREA : insets.top,
          paddingBottom: insets.bottom === 0 ? ANDROIDSAFEAREA : insets.bottom,
        }}>
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
          <Text style={[styles.uniqueNameText, {color: themeText}]}>
            {myContact.uniqueName}
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
              value={btoa(
                JSON.stringify({
                  uniqueName: myContact.uniqueName,
                  name: myContact.name || '',
                  bio: myContact?.bio || 'No bio set',
                  uuid: myContact?.uuid,
                  receiveAddress: myContact.receiveAddress,
                }),
              )}
              color={theme ? COLORS.lightModeText : COLORS.darkModeText}
              backgroundColor={
                theme ? COLORS.darkModeText : COLORS.lightModeText
              }
              logo={myContact?.icon || ICONS.logoIcon}
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

          {/* <Text style={[styles.bioHeaderText, {color: themeText}]}>Bio</Text> */}
          <View
            style={[
              styles.nameContainer,
              {backgroundColor: themeBackgroundOffset},
            ]}>
            <Text
              style={[
                styles.nameText,
                {color: themeText, textDecorationColor: themeText},
              ]}>
              {myContact?.name || 'No name set'}
            </Text>
          </View>
          <View
            style={[
              styles.bioContainer,
              {backgroundColor: themeBackgroundOffset},
            ]}>
            <ScrollView
              contentContainerStyle={{
                alignItems: myContact.bio ? null : 'center',
                flexGrow: myContact.bio ? null : 1,
              }}
              showsVerticalScrollIndicator={false}>
              <Text
                style={[
                  styles.bioText,
                  {
                    color: themeText,
                    textDecorationColor: themeText,
                    marginBottom: 'auto',
                    marginTop: 'auto',
                  },
                ]}>
                {myContact?.bio || 'No bio set'}
              </Text>
            </ScrollView>
          </View>
          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              marginTop: 'auto',
            }}>
            <TouchableOpacity
              onPress={() => {
                Share.share({
                  title: 'Blitz Contact',
                  message: btoa(
                    JSON.stringify({
                      name: myContact.name,
                      bio: myContact?.bio || 'No bio set',
                      uuid: myContact?.uuid,
                    }),
                  ),
                });
              }}
              style={[
                styles.buttonContainer,
                {
                  marginRight: 10,
                  backgroundColor: COLORS.primary,
                  borderColor: themeText,
                },
              ]}>
              <Text style={[styles.buttonText, {color: COLORS.darkModeText}]}>
                Share
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigate.navigate('EditMyProfilePage');
              }}
              style={[styles.buttonContainer, {borderColor: themeText}]}>
              <Text style={[styles.buttonText, {color: themeText}]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  innerContainer: {
    flex: 1,
    width: '95%',
    alignItems: 'center',
    ...CENTER,
  },
  uniqueNameText: {
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
  nameContainer: {
    width: '90%',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  nameText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  bioContainer: {
    width: '90%',
    height: 100,
    borderRadius: 8,
    padding: 10,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  bioText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    textDecorationLine: 'underline',
    // textAlign: 'center',
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
