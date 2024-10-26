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
  const navigate = useNavigation();

  const {decodedAddedContacts} = useGlobalContacts();

  const newContact = props.route.params?.newContact;

  const selectedContact = decodedAddedContacts.filter(
    contact =>
      (contact.uuid === newContact?.uuid && contact.isAdded) ||
      (contact.isLNURL &&
        contact.receiveAddress.toLowerCase() ===
          newContact?.receiveAddress.toLowerCase()),
  );

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
