import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import {CENTER, COLORS, ICONS} from '../../../../../constants';
import {useCallback, useEffect} from 'react';
import {useGlobalAppData} from '../../../../../../context-store/appData';
import {ANDROIDSAFEAREA} from '../../../../../constants/styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import handleBackPress from '../../../../../hooks/handleBackPress';
import CustomButton from '../../../../../functions/CustomElements/button';
import {openComposer} from 'react-native-email-link';
import {copyToClipboard} from '../../../../../functions';

export default function HistoricalGiftCardPurchases() {
  const {decodedGiftCards} = useGlobalAppData();

  const insets = useSafeAreaInsets();
  const navigate = useNavigation();

  const handleBackPressFunction = useCallback(() => {
    navigate.goBack();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        navigate.navigate('GiftCardOrderDetails', {
          item: item,
        });
      }}
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
          styles={{
            marginLeft: 'auto',
          }}
          content={`Purchased: ${new Date(item.date).toDateString()}`}
        />
        {/* <FormattedSatText
          neverHideBalance={true}
          frontText={'Cost: '}
          iconHeight={25}
          iconWidth={25}
          styles={{
            includeFontPadding: false,
          }}

          formattedBalance={formatBalanceAmount(
            numberConverter(
              item.amountSats,
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
              masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
            ),
          )}
        /> */}
      </View>
    </TouchableOpacity>
  );

  console.log(decodedGiftCards.purchasedCards);

  // useEffect(() => {
  //   async function getUserPurchases() {
  //     try {
  //       const historicalPurchases = await callGiftCardsAPI({
  //         apiEndpoint: 'getUserPurchases',
  //         accessToken: decodedGiftCards.profile?.accessToken,
  //       });

  //       if (historicalPurchases.statusCode === 400) {
  //         setErrorMessage(historicalPurchases.body.error);
  //         return;
  //       }
  //       setIsLoading(false);
  //       setPurchasedList(historicalPurchases.body.response.result.svs);
  //     } catch (err) {
  //       navigate.navigate('ErrorScreen', {
  //         errorMessage:
  //           'Not able to get gift cards, are you sure you are connected to the internet?',
  //       });
  //       console.log(err);
  //     }
  //   }
  //   getUserPurchases();
  // }, []);
  return (
    <GlobalThemeView
      styles={{paddingBottom: 0, alignItems: 'center'}}
      useStandardWidth={true}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            navigate.goBack();
          }}
          style={{marginRight: 'auto'}}>
          <ThemeImage
            lightModeIcon={ICONS.smallArrowLeft}
            darkModeIcon={ICONS.smallArrowLeft}
            lightsOutIcon={ICONS.arrow_small_left_white}
          />
        </TouchableOpacity>
      </View>
      {/* {purchasedList.length === 0 || isLoading ? (
        <FullLoadingScreen
          showLoadingIcon={
            !isLoading && purchasedList.length === 0 ? false : true
          }
          text={
            isLoading
              ? 'Getting historical purchases'
              : 'You have not purchased any gift cards'
          }
        />
      ) : ( */}

      {!decodedGiftCards.purchasedCards ||
      decodedGiftCards?.purchasedCards?.length === 0 ? (
        <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
          <ThemeText content={'You have not purchased any cards'} />
        </View>
      ) : (
        <>
          <FlatList
            data={decodedGiftCards.purchasedCards}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()} // Assuming each gift card has a unique 'id'
            style={{width: '90%'}}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View
                style={{
                  height:
                    insets.bottom < 20
                      ? ANDROIDSAFEAREA + 60
                      : insets.bottom + 60,
                }}
              />
            }
          />
          <CustomButton
            buttonStyles={{
              // marginBottom: 10,
              width: 'auto',
              ...CENTER,
              position: 'absolute',
              bottom: insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom,
            }}
            actionFunction={async () => {
              try {
                await openComposer({
                  to: 'support@thebitcoincompany.com',
                  subject: 'Gift cards payment error',
                });
              } catch (err) {
                copyToClipboard(
                  'support@thebitcoincompany.com',
                  navigate,
                  null,
                  'Support email copied',
                );
              }
            }}
            textContent={'Support'}
          />
          {/* <ThemeText
            styles={{textAlign: 'center'}}
            content={'For help, reach out to: support@thebitcoincompany.com'}
          /> */}
        </>
      )}
      {/* )} */}
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
});
