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
import {ANDROIDSAFEAREA, backArrow} from '../../../../constants/styles';
import handleBackPress from '../../../../hooks/handleBackPress';
import {useEffect} from 'react';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import {WINDOWWIDTH} from '../../../../constants/theme';
import {getContactsImage} from '../../../../functions/contacts/contactsFileSystem';

export default function MyContactProfilePage() {
  const {theme, masterInfoObject, nodeInformation} = useGlobalContextProvider();
  const navigate = useNavigation();

  const myContact = masterInfoObject.contacts.myProfile;

  const themeText = theme ? COLORS.darkModeText : COLORS.lightModeText;
  const themeBackgroundOffset = theme
    ? COLORS.darkModeBackgroundOffset
    : COLORS.lightModeBackgroundOffset;

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    (async () => {
      handleBackPress(handleBackPressFunction);
      const savedImages = await getContactsImage();
      console.log(savedImages);
    })();
  }, []);
  return (
    <GlobalThemeView useStandardWidth={true}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            navigate.goBack();
          }}>
          <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Share.share({
              title: 'Blitz Contact',
              message: `blitz-wallet.com/u/${myContact.uniqueName}`,
            });
          }}>
          <Image style={[backArrow]} source={ICONS.share} />
        </TouchableOpacity>
      </View>
      <View style={styles.innerContainer}>
        <ThemeText
          styles={{...styles.uniqueNameText}}
          content={myContact.uniqueName}
        />
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
            color={COLORS.lightModeText}
            backgroundColor={COLORS.darkModeText}
            logo={myContact?.icon || ICONS.logoIcon}
            logoSize={50}
            logoMargin={5}
            logoBorderRadius={50}
            logoBackgroundColor={COLORS.darkModeText}
          />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{width: '100%', flex: 1}}>
          <ThemeText styles={{...styles.scanText}} content={'Scan to add me'} />
          <ThemeText
            styles={{...styles.scanText, marginBottom: 10}}
            content={'as a contact'}
          />

          <View
            style={[
              styles.nameContainer,
              {backgroundColor: themeBackgroundOffset},
            ]}>
            <ThemeText
              styles={{...styles.nameText}}
              content={myContact?.name || 'No name set'}
            />
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
              <ThemeText
                styles={{...styles.bioText}}
                content={myContact?.bio || 'No bio set'}
              />
            </ScrollView>
          </View>
        </ScrollView>
        <View style={styles.shareContainer}>
          {/* <TouchableOpacity
              onPress={() => {
                Share.share({
                  title: 'Blitz Contact',
                  message: `blitz-wallet.com/u/${myContact.uniqueName}`,
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
              <ThemeText
                styles={{color: COLORS.darkModeText}}
                content={'Share'}
              />

            </TouchableOpacity> */}

          <TouchableOpacity
            onPress={() => {
              if (!nodeInformation.didConnectToNode) {
                navigate.navigate('ErrorScreen', {
                  errorMessage:
                    'Please reconnect to the internet to use this feature',
                });
                return;
              }
              navigate.navigate('EditMyProfilePage', {
                pageType: 'myProfile',
              });
            }}
            style={[styles.buttonContainer, {borderColor: themeText}]}>
            <ThemeText content={'Edit Profile'} />
          </TouchableOpacity>
        </View>
      </View>
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  innerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  uniqueNameText: {
    fontSize: SIZES.xxLarge,
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
    fontSize: SIZES.large,
    textAlign: 'center',
  },
  bioHeaderText: {
    fontSize: SIZES.xxLarge,
    marginBottom: 10,
  },
  nameContainer: {
    width: '100%',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  nameText: {
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  bioContainer: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    padding: 10,
  },
  bioText: {
    textDecorationLine: 'underline',
    marginBottom: 'auto',
    marginTop: 'auto',
  },

  shareContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 'auto',
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 'auto',

    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
});
