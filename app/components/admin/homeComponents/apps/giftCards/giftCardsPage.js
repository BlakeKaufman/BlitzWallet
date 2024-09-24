import {
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import {useGlobalAppData} from '../../../../../../context-store/appData';
import {useEffect, useState} from 'react';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';
import {formatBalanceAmount} from '../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import GetThemeColors from '../../../../../hooks/themeColors';
import {CENTER, COLORS, ICONS} from '../../../../../constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA} from '../../../../../constants/styles';
import CountryFlag from 'react-native-country-flag';
import {useNavigation} from '@react-navigation/native';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import {encriptMessage} from '../../../../../functions/messaging/encodingAndDecodingMessages';
import {getPublicKey} from 'nostr-tools';
import {isMoreThan40MinOld} from '../../../../../functions/rotateAddressDateChecker';
import callGiftCardsAPI from './giftCardAPI';
import handleBackPress from '../../../../../hooks/handleBackPress';

export default function GiftCardPage(props) {
  const {contactsPrivateKey, theme, darkModeType} = useGlobalContextProvider();

  const publicKey = getPublicKey(contactsPrivateKey);
  const {decodedGiftCards, toggleGlobalAppDataInformation} = useGlobalAppData();
  const {backgroundOffset, textInputBackground, textInputColor} =
    GetThemeColors();
  const insets = useSafeAreaInsets();
  const [giftCards, setGiftCards] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [giftCardSearch, setGiftCardSearch] = useState('');
  const navigate = useNavigation();

  const userLocal = decodedGiftCards?.profile?.isoCode?.toUpperCase() || 'US';

  function handleBackPressFunction() {
    props.navigation.reset({
      index: 0, // The index of the route to focus on
      routes: [{name: 'HomeAdmin'}], // Array of routes to set in the stack
    });
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const giftCards = await callGiftCardsAPI({
          apiEndpoint: 'listGiftCards',
        });

        if (giftCards.statusCode === 400) {
          setErrorMessage(giftCards.body.error);
          return;
        }
        setGiftCards(giftCards.body.giftCards);
      } catch (err) {
        navigate.navigate('ErrorScreen', {
          errorMessage:
            'Not able to get gift cards, are you sure you are connected to the internet?',
        });
        console.log(err);
      }
    })();
  }, [userLocal]);

  // Filter gift cards based on search input
  const filteredGiftCards = giftCards.filter(
    giftCard => {
      return (
        giftCard.countries.includes(userLocal || 'US') &&
        giftCard.name.toLowerCase().startsWith(giftCardSearch.toLowerCase()) &&
        giftCard.paymentTypes.includes('Lightning') &&
        giftCard.denominations.length != 0
      );
    },
    [userLocal],
  );

  console.log(filteredGiftCards);

  // Render each gift card item
  const renderItem = ({item}) => (
    <View
      // onPress={() => {
      //   navigate.navigate('ExpandedGiftCardPage', {selectedItem: item});
      // }}
      style={{
        flexDirection: 'row',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: COLORS.gray2,
        alignItems: 'center',
      }}>
      <Image
        style={{width: 55, height: 55, marginRight: 10, borderRadius: 10}}
        source={{uri: item.logo}}
      />
      <View>
        <ThemeText
          styles={{fontWeight: '500', marginBottom: 5}}
          content={item.name}
        />
        <ThemeText
          content={`${'$'}${
            item[
              item.denominations.length === 0
                ? 'defaultDenoms'
                : 'denominations'
            ][0]
          } ${
            item.denominations.length > 1 ? '-' : ''
          } ${'$'}${formatBalanceAmount(
            item[
              item.denominations.length === 0
                ? 'defaultDenoms'
                : 'denominations'
            ][
              item[
                item.denominations.length === 0
                  ? 'defaultDenoms'
                  : 'denominations'
              ].length - 1
            ],
          )}`}
        />
      </View>
      <TouchableOpacity
        onPress={() => {
          navigate.navigate('ExpandedGiftCardPage', {selectedItem: item});
        }}
        style={{
          marginLeft: 'auto',
          paddingHorizontal: 15,
          paddingVertical: 8,
          borderRadius: 8,
          backgroundColor: backgroundOffset,
        }}>
        <ThemeText styles={{marginLeft: 'auto'}} content={'View'} />
      </TouchableOpacity>
      {/* <ThemeText
        styles={{
          color: theme && darkModeType ? COLORS.darkModeText : COLORS.primary,
          marginLeft: 'auto',
        }}
        content={`${item.defaultSatsBackPercentage}%`}
      /> */}
    </View>
  );

  return (
    <GlobalThemeView styles={{paddingBottom: 0}} useStandardWidth={true}>
      <View style={{flex: 1}}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.reset({
                index: 0, // The index of the route to focus on
                routes: [{name: 'HomeAdmin'}], // Array of routes to set in the stack
              });
            }}
            style={{marginRight: 'auto'}}>
            <ThemeImage
              lightModeIcon={ICONS.smallArrowLeft}
              darkModeIcon={ICONS.smallArrowLeft}
              lightsOutIcon={ICONS.arrow_small_left_white}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigate.navigate('CountryList')}>
            <CountryFlag isoCode={userLocal} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{marginLeft: 10}}
            onPress={() => navigate.navigate('HistoricalGiftCardPurchases')}>
            <ThemeImage
              darkModeIcon={ICONS.receiptIcon}
              lightModeIcon={ICONS.receiptIcon}
              lightsOutIcon={ICONS.receiptWhite}
            />
          </TouchableOpacity>
        </View>
        <TextInput
          value={giftCardSearch}
          onChangeText={setGiftCardSearch}
          style={{
            ...styles.textInput,
            color: textInputColor,
            backgroundColor: textInputBackground,
          }}
          placeholder="Search"
          placeholderTextColor={COLORS.opaicityGray}
        />

        {filteredGiftCards.length === 0 || errorMessage ? (
          <FullLoadingScreen
            showLoadingIcon={
              giftCards.length === 0 && !errorMessage ? true : false
            }
            text={
              giftCards.length === 0 && !errorMessage
                ? 'Getting gift cards'
                : errorMessage || 'No gift cards available'
            }
          />
        ) : (
          <FlatList
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={3}
            removeClippedSubviews={true}
            data={filteredGiftCards}
            getItemLayout={(data, index) => ({
              length: 88,
              offset: 88 * index,
              index,
            })}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()} // Assuming each gift card has a unique 'id'
            contentContainerStyle={{width: '90%', ...CENTER}}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View
                style={{
                  height:
                    insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom + 20,
                }}
              />
            }
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
    alignItems: 'center',
    ...CENTER,
  },
  textInput: {
    width: '90%',
    backgroundColor: COLORS.darkModeText,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 20,
    borderRadius: 8,
    color: COLORS.lightModeText,
    ...CENTER,
  },
});
