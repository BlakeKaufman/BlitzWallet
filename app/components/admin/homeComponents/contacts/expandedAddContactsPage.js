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
import EditMyProfilePage from './editMyProfilePage';

export default function ExpandedAddContactsPage(props) {
  const {theme, nodeInformation, contactsPrivateKey, darkModeType} =
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
    contact => contact.uuid === newContact?.uuid && contact.isAdded,
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
        <EditMyProfilePage
          pageType="addedContact"
          selectedAddedContact={newContact}
          fromInitialAdd={true}
        />
        // <GlobalThemeView useStandardWidth={true}>
        //   <View style={styles.topBar}>
        //     <TouchableOpacity
        //       onPress={() => {
        //         if (navigate.canGoBack()) navigate.goBack();
        //         else navigate.replace('HomeAdmin');
        //       }}>
        //       <ThemeImage
        //         darkModeIcon={ICONS.smallArrowLeft}
        //         lightModeIcon={ICONS.smallArrowLeft}
        //         lightsOutIcon={ICONS.arrow_small_left_white}
        //       />
        //     </TouchableOpacity>
        //   </View>
        //   <ScrollView
        //     showsVerticalScrollIndicator={false}
        //     style={{width: '100%', flex: 1}}>
        //     <View style={styles.innerContainer}>
        //       <View
        //         style={[
        //           styles.profileImage,
        //           {
        //             // borderColor: backgroundOffset,
        //             backgroundColor: backgroundOffset,
        //           },
        //         ]}>
        //         <Image
        //           source={
        //             selectedContact?.profileImage
        //               ? {
        //                   uri: selectedContact?.profileImag,
        //                 }
        //               : darkModeType && theme
        //               ? ICONS.userWhite
        //               : ICONS.userIcon
        //           }
        //           style={
        //             selectedContact?.profileImage
        //               ? {width: '100%', height: undefined, aspectRatio: 1}
        //               : {width: '50%', height: '50%'}
        //           }
        //         />
        //       </View>
        //       <ThemeText
        //         styles={{...styles.uniqueNameText}}
        //         content={newContact.uniqueName}
        //       />

        //       <View
        //         style={[
        //           styles.nameContainer,
        //           {backgroundColor: backgroundOffset},
        //         ]}>
        //         <ThemeText
        //           styles={{...styles.nameText}}
        //           content={newContact?.name || 'No name set'}
        //         />
        //       </View>
        //       <View
        //         style={[
        //           styles.bioContainer,
        //           {backgroundColor: backgroundOffset},
        //         ]}>
        //         <ScrollView
        //           contentContainerStyle={{
        //             alignItems: newContact.bio ? null : 'center',
        //             flexGrow: newContact.bio ? null : 1,
        //           }}
        //           showsVerticalScrollIndicator={false}>
        //           <ThemeText
        //             styles={{...styles.bioText}}
        //             content={newContact?.bio || 'No bio set'}
        //           />
        //         </ScrollView>
        //       </View>
        //     </View>
        //   </ScrollView>
        //   <CustomButton
        //     buttonStyles={{width: 'auto', ...CENTER}}
        //     actionFunction={() => {
        //       if (!nodeInformation.didConnectToNode) {
        //         navigate.navigate('ErrorScreen', {
        //           errorMessage:
        //             'Please reconnect to the internet to use this feature',
        //         });
        //         return;
        //       }
        //       addContact(
        //         newContact,
        //         globalContactsInformation,
        //         toggleGlobalContactsInformation,
        //         navigate,
        //         undefined,
        //         contactsPrivateKey,
        //       );
        //     }}
        //     textContent={'Add contact'}
        //   />
        // </GlobalThemeView>
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
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 125,
    // borderWidth: 5,
    ...CENTER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },

  uniqueNameText: {
    fontSize: SIZES.large,
    fontWeight: 500,
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
