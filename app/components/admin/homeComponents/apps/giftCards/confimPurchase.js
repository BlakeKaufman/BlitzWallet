import {StyleSheet, useWindowDimensions, View} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import GetThemeColors from '../../../../../hooks/themeColors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CENTER, COLORS, SIZES} from '../../../../../constants';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import SwipeButton from 'rn-swipe-button';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {getLiquidTxFee} from '../../../../../functions/liquidWallet';
import {useGlobalAppData} from '../../../../../../context-store/appData';
import {calculateBoltzFeeNew} from '../../../../../functions/boltz/boltzFeeNew';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';
import getGiftCardAPIEndpoint from './getGiftCardAPIEndpoint';
import {ANDROIDSAFEAREA} from '../../../../../constants/styles';
import {getCountryInfoAsync} from 'react-native-country-picker-modal/lib/CountryService';
import {LIQUIDAMOUTBUFFER} from '../../../../../constants/math';
export default function ConfirmGiftCardPurchase(props) {
  const {
    masterInfoObject,
    nodeInformation,
    minMaxLiquidSwapAmounts,
    theme,
    liquidNodeInformation,
  } = useGlobalContextProvider();
  const {decodedGiftCards} = useGlobalAppData();
  const {backgroundColor, backgroundOffset, textColor} = GetThemeColors();
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  // const [liquidTxFee, setLiquidTxFee] = useState(null);
  const liquidTxFee = process.env.BOLTZ_ENVIRONMENT === 'testnet' ? 30 : 270;
  const [retrivedInformation, setRetrivedInformation] = useState({
    countryInfo: {},
    productInfo: {},
  });

  const ISOCode = decodedGiftCards.profile?.isoCode;
  const productID = props?.productId;
  const productPrice = props?.price;
  const productQantity = props?.quantity;

  useEffect(() => {
    async function getGiftCardInfo() {
      try {
        const quotePurchase = await fetch(
          `${getGiftCardAPIEndpoint()}.netlify/functions/theBitcoinCompany`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'quoteGiftCard',
              productId: productID, //string
              cardValue: Number(productPrice), //number
              quantity: Number(productQantity), //number
            }),
          },
        );
        // const quotePurchase = await callGiftCardsAPI({
        //   apiEndpoint: 'quoteGiftCard',
        //   accessToken: decodedGiftCards.profile?.accessToken,
        //   productId: props.productId, //string
        //   cardValue: Number(props.price), //number
        //   quantity: Number(props.quantity), //number
        // });

        console.log(quotePurchase);

        const data = await quotePurchase.json();
        console.log(data);

        const countryInfo = await getCountryInfoAsync({
          countryCode: ISOCode || 'US',
        });

        if (!!data.error) {
          navigate.goBack();
          navigate.navigate('ErrorScreen', {
            errorMessage: data.error,
          });
          return;
        }

        // const txFee = await getLiquidTxFee({
        //   amountSat: data?.response?.result?.satsCost || 1500,
        // });
        setRetrivedInformation({
          countryInfo: countryInfo,
          productInfo: data.response.result,
        });
        // setLiquidTxFee(Number(txFee) || 250);
      } catch (err) {
        console.log(err);
        navigate.goBack();
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Error getting payment detials',
        });
      }
    }
    getGiftCardInfo();
  }, []);

  const fee = liquidTxFee
    ? liquidNodeInformation.userBalance >
      retrivedInformation.productInfo.satsCost + LIQUIDAMOUTBUFFER
      ? liquidTxFee
      : liquidTxFee +
        calculateBoltzFeeNew(
          retrivedInformation.productInfo.satsCost,
          'liquid-ln',
          minMaxLiquidSwapAmounts.submarineSwapStats,
        )
    : 0;

  return (
    <View
      style={{
        height: useWindowDimensions().height * 0.5,
        width: '100%',
        backgroundColor: backgroundColor,

        // borderTopColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
        // borderTopWidth: 10,

        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,

        // borderTopLeftRadius: 10,
        // borderTopRightRadius: 10,

        padding: 10,
        paddingBottom: insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom,
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: backgroundOffset,
          },
        ]}></View>

      {Object.keys(retrivedInformation.productInfo).length === 0 ? (
        <FullLoadingScreen />
      ) : (
        <>
          <ThemeText
            styles={{
              fontSize: SIZES.large,
              textAlign: 'center',
            }}
            content={`Quantity: ${props.quantity}`}
          />
          <ThemeText
            styles={{fontSize: SIZES.large, marginTop: 10}}
            content={`Card amount: ${props.price} ${retrivedInformation.countryInfo.currency}`}
          />
          {/* <ThemeText
            styles={{fontSize: SIZES.large, marginTop: 10}}
            content={`Bitcoin price: $${formatBalanceAmount(
              productInfo.bitcoinPrice.toFixed(0),
            )}`}
          /> */}

          {/* <FormattedSatText
            neverHideBalance={true}
            iconHeight={15}
            iconWidth={15}
            containerStyles={{marginTop: 10}}
            styles={{
              fontSize: SIZES.large,
              textAlign: 'center',
            }}
            frontText={'Sats back: '}
            formattedBalance={formatBalanceAmount(
              numberConverter(
                productInfo.satsBack,
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
                masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
              ),
            )}
          /> */}
          <FormattedSatText
            neverHideBalance={true}
            iconHeight={15}
            iconWidth={15}
            containerStyles={{marginTop: 'auto'}}
            styles={{
              fontSize: SIZES.large,
              textAlign: 'center',
            }}
            frontText={'Price: '}
            formattedBalance={formatBalanceAmount(
              numberConverter(
                retrivedInformation.productInfo.satsCost,
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
                masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
              ),
            )}
          />

          <FormattedSatText
            neverHideBalance={true}
            iconHeight={15}
            iconWidth={15}
            containerStyles={{marginTop: 5, marginBottom: 'auto'}}
            styles={{
              textAlign: 'center',
            }}
            frontText={'Fee: '}
            formattedBalance={formatBalanceAmount(
              numberConverter(
                fee,
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
                masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
              ),
            )}
          />

          <SwipeButton
            containerStyles={{
              width: '90%',
              maxWidth: 350,
              borderColor: textColor,
              ...CENTER,
              marginBottom: 20,
            }}
            titleStyles={{fontWeight: 'bold', fontSize: SIZES.large}}
            swipeSuccessThreshold={100}
            onSwipeSuccess={() => {
              navigate.goBack();

              setTimeout(() => {
                props.purchaseGiftCard(
                  retrivedInformation.productInfo.satsCost,
                );
              }, 200);
            }}
            railBackgroundColor={theme ? COLORS.darkModeText : COLORS.primary}
            railBorderColor={
              theme ? backgroundColor : COLORS.lightModeBackground
            }
            height={55}
            railStyles={{
              backgroundColor: theme ? backgroundColor : COLORS.darkModeText,
              borderColor: theme ? backgroundColor : COLORS.darkModeText,
            }}
            thumbIconBackgroundColor={
              theme ? backgroundColor : COLORS.darkModeText
            }
            thumbIconBorderColor={theme ? backgroundColor : COLORS.darkModeText}
            titleColor={theme ? backgroundColor : COLORS.darkModeText}
            title="Slide to confirm"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: 120,
    height: 8,
    marginTop: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  borderTop: {
    width: '100%',
    height: 60,
    position: 'absolute',
    top: -5,
    zIndex: -1,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  optionsContainer: {
    width: '100%',
    height: '100%',
  },
});
