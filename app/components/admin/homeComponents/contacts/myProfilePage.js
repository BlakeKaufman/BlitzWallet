import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Share,
  FlatList,
} from 'react-native';
import {CENTER, COLORS, ICONS, SIZES} from '../../../../constants';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import handleBackPress from '../../../../hooks/handleBackPress';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import {useGlobalContacts} from '../../../../../context-store/globalContacts';
import GetThemeColors from '../../../../hooks/themeColors';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import ProfilePageTransactions from './internalComponents/profilePageTransactions';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA} from '../../../../constants/styles';
import {useGlobalThemeContext} from '../../../../../context-store/theme';
import {useAppStatus} from '../../../../../context-store/appStatus';

export default function MyContactProfilePage({navigation}) {
  const {isConnectedToTheInternet} = useAppStatus();
  const {theme, darkModeType} = useGlobalThemeContext();
  const {
    globalContactsInformation,
    myProfileImage,
    decodedAddedContacts,
    contactsMessags,
  } = useGlobalContacts();
  const {backgroundOffset, textInputBackground, textInputColor} =
    GetThemeColors();
  const navigate = useNavigation();
  const [showList, setShowList] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setShowList(true);

      return () => {
        console.log('Screen is unfocused');
        setShowList(false);
      };
    }, []),
  );

  const myContact = globalContactsInformation.myProfile;

  const createdPayments = useMemo(() => {
    let tempArray = [];
    for (let contact of Object.keys(contactsMessags)) {
      if (contact === 'lastMessageTimestamp') continue;
      const data = contactsMessags[contact];
      const selectedAddedContact = decodedAddedContacts.find(
        contactElement => contactElement.uuid === contact,
      );

      for (let message of data.messages) {
        tempArray.push({
          transaction: message,
          selectedProfileImage: selectedAddedContact?.profileImage || null,
          name:
            selectedAddedContact?.name ||
            selectedAddedContact?.uniqueName ||
            'Unknown',
          contactUUID: selectedAddedContact?.uuid || contact,
        });
      }
    }
    tempArray.slice(0, 50);

    return tempArray;
  }, [decodedAddedContacts, contactsMessags]);

  const insets = useSafeAreaInsets();
  const handleBackPressFunction = useCallback(() => {
    navigate.goBack();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  return (
    <GlobalThemeView styles={{paddingBottom: 0}} useStandardWidth={true}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            navigate.goBack();
          }}>
          <ThemeImage
            darkModeIcon={ICONS.smallArrowLeft}
            lightModeIcon={ICONS.smallArrowLeft}
            lightsOutIcon={ICONS.arrow_small_left_white}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{marginLeft: 'auto', marginRight: 5}}
          onPress={() => {
            Share.share({
              title: 'Blitz Contact',
              message: `blitz-wallet.com/u/${myContact.uniqueName}`,
            });
          }}>
          <ThemeImage
            darkModeIcon={ICONS.share}
            lightModeIcon={ICONS.share}
            lightsOutIcon={ICONS.shareWhite}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (!isConnectedToTheInternet) {
              navigate.navigate('ErrorScreen', {
                errorMessage:
                  'Please connect to the internet to use this feature',
              });
              return;
            }
            navigate.navigate('EditMyProfilePage', {
              pageType: 'myProfile',
              fromSettings: false,
            });
          }}>
          <ThemeImage
            darkModeIcon={ICONS.settingsIcon}
            lightModeIcon={ICONS.settingsIcon}
            lightsOutIcon={ICONS.settingsWhite}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.innerContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('CustomHalfModal', {
              wantedContent: 'myProfileQRcode',
              sliderHight: 0.5,
            });
          }}>
          <View>
            <View
              style={[
                styles.profileImage,
                {
                  backgroundColor: backgroundOffset,
                },
              ]}>
              <Image
                source={
                  myProfileImage
                    ? {
                        uri: myProfileImage,
                      }
                    : darkModeType && theme
                    ? ICONS.userWhite
                    : ICONS.userIcon
                }
                style={
                  myProfileImage
                    ? {width: '100%', aspectRatio: 1}
                    : {width: '50%', height: '50%'}
                }
              />
            </View>
            <View style={styles.scanProfileImage}>
              <Image
                source={ICONS.scanQrCodeDark}
                style={{width: 18, height: 18}}
              />
            </View>
          </View>
        </TouchableOpacity>
        <ThemeText
          styles={{
            ...styles.uniqueNameText,
            marginBottom: myContact?.name ? 0 : 10,
          }}
          content={myContact.uniqueName}
        />
        {myContact?.name && (
          <ThemeText styles={{...styles.nameText}} content={myContact?.name} />
        )}
        <View
          style={[
            styles.bioContainer,
            {marginTop: 10, backgroundColor: textInputBackground},
          ]}>
          <ScrollView
            contentContainerStyle={{
              alignItems: myContact.bio ? null : 'center',
              flexGrow: myContact.bio ? null : 1,
            }}
            showsVerticalScrollIndicator={false}>
            <ThemeText
              styles={{...styles.bioText, color: textInputColor}}
              content={myContact?.bio || 'No bio set'}
            />
          </ScrollView>
        </View>
        {createdPayments?.length != 0 && showList ? (
          <FlatList
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom:
                insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom,
            }}
            showsVerticalScrollIndicator={false}
            style={{
              width: '95%',
            }}
            data={createdPayments}
            renderItem={({item, index}) => {
              return (
                <ProfilePageTransactions
                  key={index}
                  transaction={item}
                  id={index}
                />
              );
            }}
          />
        ) : (
          <ThemeText
            styles={{marginTop: 20}}
            content={'No transaction history'}
          />
        )}
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
  },

  innerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  uniqueNameText: {
    fontSize: SIZES.xxLarge,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 125,
    backgroundColor: 'red',
    ...CENTER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  scanProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: COLORS.darkModeText,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 12.5,
    bottom: 12.5,
    zIndex: 2,
  },
  nameText: {
    textAlign: 'center',
    marginBottom: 10,
  },
  bioContainer: {
    width: '90%',
    minHeight: 60,
    maxHeight: 80,
    borderRadius: 8,
    padding: 10,
    backgroundColor: COLORS.darkModeText,
  },
  bioText: {
    marginBottom: 'auto',
    marginTop: 'auto',
  },
});
