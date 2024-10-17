import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Share,
  FlatList,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import handleBackPress from '../../../../hooks/handleBackPress';
import {useCallback, useEffect, useMemo} from 'react';
import {GlobalThemeView, ThemeText} from '../../../../functions/CustomElements';
import {useGlobalContacts} from '../../../../../context-store/globalContacts';
import GetThemeColors from '../../../../hooks/themeColors';
import ThemeImage from '../../../../functions/CustomElements/themeImage';
import ProfilePageTransactions from './internalComponents/profilePageTransactions';

export default function MyContactProfilePage({navigation}) {
  const {nodeInformation, darkModeType, theme} = useGlobalContextProvider();
  const {
    globalContactsInformation,
    myProfileImage,
    decodedAddedContacts,
    allContactsPayments,
  } = useGlobalContacts();
  const {textColor, backgroundOffset, textInputBackground, textInputColor} =
    GetThemeColors();
  const navigate = useNavigation();

  const myContact = globalContactsInformation.myProfile;

  const handleBackPressFunction = useCallback(() => {
    navigate.goBack();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  return (
    <GlobalThemeView useStandardWidth={true}>
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
          style={{marginLeft: 'auto', marginRight: 10}}
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
                  // borderColor: backgroundOffset,
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
                    ? {width: '100%', height: undefined, aspectRatio: 1}
                    : {width: '50%', height: '50%'}
                }
              />
            </View>
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 20,
                backgroundColor: COLORS.darkModeText,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                right: 10,
                bottom: 5,
                zIndex: 2,
              }}>
              <Image
                source={ICONS.scanQrCodeDark}
                style={{width: '60%', height: undefined, aspectRatio: 1}}
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
        {allContactsPayments?.length != 0 ? (
          <FlatList
            showsVerticalScrollIndicator={false}
            style={{
              width: '95%',
              marginTop: 5,
            }}
            data={allContactsPayments.sort((a, b) => {
              if (a?.transaction?.uuid && b?.transaction?.uuid) {
                return b?.transaction?.uuid - a?.transaction?.uuid;
              }
              return 0;
            })}
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
    marginBottom: 5,
  },

  innerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
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
  nameText: {
    textAlign: 'center',
    marginBottom: 20,
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
