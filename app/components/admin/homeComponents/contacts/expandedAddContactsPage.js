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
import {useCallback, useEffect} from 'react';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import CustomButton from '../../../../functions/CustomElements/button';

import ExpandedContactsPage from './expandedContactPage';
import addContact from './internalComponents/addContactFunc';
import {useGlobalContacts} from '../../../../../context-store/globalContacts';
import GetThemeColors from '../../../../hooks/themeColors';
import ThemeImage from '../../../../functions/CustomElements/themeImage';

export default function ExpandedAddContactsPage(props) {
  const {theme, nodeInformation, contactsPrivateKey} =
    useGlobalContextProvider();
  const navigate = useNavigation();
  const {textColor, backgroundOffset} = GetThemeColors();

  const {
    decodedAddedContacts,
    globalContactsInformation,
    toggleGlobalContactsInformation,
  } = useGlobalContacts();

  const newContact = props.route.params?.newContact;

  const selectedContact = decodedAddedContacts.filter(
    contact => contact.uuid === newContact.uuid,
  );

  const themeBackgroundOffset = theme
    ? COLORS.darkModeBackgroundOffset
    : COLORS.lightModeBackgroundOffset;

  const handleBackPressFunction = useCallback(() => {
    if (navigate.canGoBack()) navigate.goBack();
    else navigate.replace('HomeAdmin');
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);
  return (
    <>
      {selectedContact.length > 0 ? (
        <ExpandedContactsPage uuid={selectedContact[0].uuid} />
      ) : (
        <GlobalThemeView useStandardWidth={true}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => {
                if (navigate.canGoBack()) navigate.goBack();
                else navigate.replace('HomeAdmin');
              }}>
              <ThemeImage
                darkModeIcon={ICONS.smallArrowLeft}
                lightModeIcon={ICONS.smallArrowLeft}
                lightsOutIcon={ICONS.arrow_small_left_white}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Share.share({
                  title: 'Blitz Contact',
                  message: `blitz-wallet.com/u/${newContact?.uniqueName}`,
                });
              }}>
              <ThemeImage
                darkModeIcon={ICONS.share}
                lightModeIcon={ICONS.share}
                lightsOutIcon={ICONS.shareWhite}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.innerContainer}>
            <ThemeText
              styles={{...styles.uniqueNameText}}
              content={newContact.uniqueName}
            />
            <View
              style={[
                styles.qrContainer,
                {
                  backgroundColor: backgroundOffset,
                },
              ]}>
              <QRCode
                size={230}
                quietZone={10}
                value={btoa(
                  JSON.stringify({
                    uniqueName: newContact.uniqueName,
                    name: newContact.name || '',
                    bio: newContact?.bio || 'No bio set',
                    uuid: newContact?.uuid,
                    receiveAddress: newContact.receiveAddress,
                  }),
                )}
                color={COLORS.lightModeText}
                backgroundColor={COLORS.darkModeText}
                logo={newContact?.icon || ICONS.logoIcon}
                logoSize={50}
                logoMargin={5}
                logoBorderRadius={50}
                logoBackgroundColor={COLORS.darkModeText}
              />
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{width: '100%', flex: 1}}>
              {/* <ThemeText styles={{...styles.scanText}} content={'Scan to add me'} />
          <ThemeText
            styles={{...styles.scanText, marginBottom: 10}}
            content={'as a contact'}
          /> */}

              <View
                style={[
                  styles.nameContainer,
                  {backgroundColor: backgroundOffset},
                ]}>
                <ThemeText
                  styles={{...styles.nameText}}
                  content={newContact?.name || 'No name set'}
                />
              </View>
              <View
                style={[
                  styles.bioContainer,
                  {backgroundColor: backgroundOffset},
                ]}>
                <ScrollView
                  contentContainerStyle={{
                    alignItems: newContact.bio ? null : 'center',
                    flexGrow: newContact.bio ? null : 1,
                  }}
                  showsVerticalScrollIndicator={false}>
                  <ThemeText
                    styles={{...styles.bioText}}
                    content={newContact?.bio || 'No bio set'}
                  />
                </ScrollView>
              </View>
            </ScrollView>
            <View style={styles.shareContainer}>
              {/* <TouchableOpacity
                onPress={() => {
                  Share.share({
                    title: 'Blitz Contact',
                    message: `blitz-wallet.com/u/${newContact.uniqueName}`,
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

              <CustomButton
                buttonStyles={{width: 'auto', marginRight: 10}}
                actionFunction={() => {
                  if (!nodeInformation.didConnectToNode) {
                    navigate.navigate('ErrorScreen', {
                      errorMessage:
                        'Please reconnect to the internet to use this feature',
                    });
                    return;
                  }
                  addContact(
                    newContact,
                    globalContactsInformation,
                    toggleGlobalContactsInformation,
                    navigate,
                    undefined,
                    contactsPrivateKey,
                  );
                }}
                textContent={'Add contact'}
              />

              {/* <TouchableOpacity
            onPress={() => {
              if (!nodeInformation.didConnectToNode) {
                navigate.navigate('ErrorScreen', {
                  errorMessage:
                    'Please reconnect to the internet to use this feature',
                });
                return;
              }
              addContactFunction();
            }}
            style={[styles.buttonContainer, {borderColor: themeText}]}>
            <ThemeText content={'Edit Profile'} />
          </TouchableOpacity> */}
            </View>
          </View>
        </GlobalThemeView>
      )}
    </>
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
