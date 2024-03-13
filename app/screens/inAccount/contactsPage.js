import {useNavigation} from '@react-navigation/native';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SHADOWS, SIZES} from '../../constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGlobalContextProvider} from '../../../context-store/context';
import {useEffect, useRef, useState} from 'react';
import {getLocalStorageItem, setLocalStorageItem} from '../../functions';
import {
  connectToRelay,
  getPubPrivateKeys,
  sendNostrMessage,
} from '../../functions/noster';
import {removeLocalStorageItem} from '../../functions/localStorage';

export default function ContactsPage() {
  const isInitialRender = useRef(true);
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const [contactsList, setContactsList] = useState([]);
  const [userKeys, setUserKeys] = useState({
    pubkey: '',
    privKey: '',
  });
  const [updateContactsList, setUpdateContactsList] = useState(0);
  const [nostrSocket, setNostrSocket] = useState({});

  useEffect(() => {
    (async () => {
      if (isInitialRender.current) {
        const [pubkey, privkey] = await getPubPrivateKeys();
        setUserKeys({
          privKey: privkey,
          pubkey: pubkey,
        });
        isInitialRender.current = false;
        const {socket} = await connectToRelay([pubkey], privkey, pubkey);
        setNostrSocket(socket);
      }
      const contactsList = JSON.parse(await getLocalStorageItem('contacts'));

      if (contactsList) setContactsList(contactsList);
    })();
  }, [updateContactsList]);

  const contactElements =
    contactsList.length > 0 &&
    contactsList.map((contact, id) => {
      return (
        <TouchableOpacity
          key={id}
          onPress={() => {
            // opens send page with perameter that has contact.id
            sendNostrMessage(
              nostrSocket,
              'last try',
              userKeys.privKey,
              userKeys.pubkey,
            );
          }}>
          <View>
            <Text>{contact.fname}</Text>
          </View>
        </TouchableOpacity>
      );
    });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.globalContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            styles.globalContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,
            },
          ]}>
          <View
            style={[
              styles.topBarContainer,
              {
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
                paddingTop: insets.top + 10,
              },
            ]}>
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={() => {
                  navigate.goBack();
                }}>
                <Image
                  style={{width: 30, height: 30}}
                  source={ICONS.smallArrowLeft}
                />
              </TouchableOpacity>

              <Text
                style={[
                  styles.headerText,
                  {
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    transform: [{translateX: -2.5}],
                  },
                ]}>
                Contacts
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigate.navigate('AddContact', {
                    setUpdateContactsList: setUpdateContactsList,
                  });
                }}>
                <Image style={styles.backButton} source={ICONS.plusIcon} />
              </TouchableOpacity>
            </View>
            <View>
              <Image style={styles.searchInputIcon} source={ICONS.searchIcon} />

              <TextInput
                placeholder="Search"
                placeholderTextColor={
                  theme ? COLORS.darkModeText : COLORS.lightModeText
                }
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: theme
                      ? COLORS.darkModeBackground
                      : COLORS.lightModeBackground,
                  },
                ]}
              />
            </View>
          </View>
          <SafeAreaView style={styles.globalContainer}>
            {contactElements ? (
              <ScrollView style={{flex: 1}}>{contactElements}</ScrollView>
            ) : (
              <View style={styles.noContactsContainer}>
                <View>
                  <Text
                    style={[
                      styles.noContactsText,
                      {
                        color: theme
                          ? COLORS.darkModeText
                          : COLORS.lightModeText,
                      },
                    ]}>
                    You have no contacts
                  </Text>
                </View>
              </View>
            )}
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  topBarContainer: {
    paddingHorizontal: 10,

    paddingBottom: 20,

    borderBottomColor: COLORS.offsetBackground,
    borderBottomWidth: 1,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    width: 20,
    height: 20,
  },

  headerText: {fontFamily: FONT.Title_Bold, fontSize: SIZES.large},

  searchInputIcon: {
    position: 'absolute',
    top: 7.5,
    left: 5,
    width: 20,
    height: 20,
    zIndex: 1,
  },

  searchInput: {
    width: '100%',
    padding: 10,
    paddingLeft: 45,
    borderRadius: 8,

    ...SHADOWS.small,
    ...CENTER,
  },

  noContactsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noContactsText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
  },
});
