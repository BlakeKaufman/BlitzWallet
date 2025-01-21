import {Platform, StyleSheet, useWindowDimensions, View} from 'react-native';
import GetThemeColors from '../../../../../hooks/themeColors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CENTER, SIZES} from '../../../../../constants';
import {formatBalanceAmount, numberConverter} from '../../../../../functions';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import {ANDROIDSAFEAREA} from '../../../../../constants/styles';
import CustomButton from '../../../../../functions/CustomElements/button';
import {useEffect, useState} from 'react';
import {
  buyBitcoin,
  BuyBitcoinProvider,
  prepareBuyBitcoin,
} from '@breeztech/react-native-breez-sdk-liquid';
import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';
import * as WebBrowser from 'expo-web-browser';
export default function ConfirmBitcoinPurchase(props) {
  const {purchaseAmount} = props;
  const {masterInfoObject, nodeInformation} = useGlobalContextProvider();
  const {backgroundColor, backgroundOffset, textColor} = GetThemeColors();
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const [prepareResponse, setPrepareResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const bottomPadding = Platform.select({
    ios: insets.bottom,
    android: ANDROIDSAFEAREA,
  });

  useEffect(() => {
    async function createPurchaseRequest() {
      try {
        const prepareRes = await prepareBuyBitcoin({
          provider: BuyBitcoinProvider.MOONPAY,
          amountSat: Number(purchaseAmount),
        });

        // Check the fees are acceptable before proceeding
        const receiveFeesSat = prepareRes.feesSat;
        console.log(`Fees: ${receiveFeesSat} sats`);
        setPrepareResponse(prepareRes);
      } catch (err) {
        console.log(err);
        navigate.navigate('errorScreen', {
          errorMessage: 'Unable to create purchase request',
        });
      }
    }
    createPurchaseRequest();
  }, []);

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
        paddingBottom: bottomPadding,
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

      {!prepareResponse || isLoading ? (
        <FullLoadingScreen
          textStyles={{textAlign: 'center'}}
          text={isLoading ? 'Getting invoice information' : 'Retriving fees'}
        />
      ) : (
        <>
          <FormattedSatText
            neverHideBalance={true}
            iconHeight={15}
            iconWidth={15}
            containerStyles={{marginTop: 'auto'}}
            styles={{
              textAlign: 'center',
              fontSize: SIZES.large,
            }}
            frontText={'Amount: '}
            formattedBalance={formatBalanceAmount(
              numberConverter(
                prepareResponse.amountSat,
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
              fontSize: SIZES.large,
            }}
            frontText={'Fee: '}
            formattedBalance={formatBalanceAmount(
              numberConverter(
                prepareResponse.feesSat,
                masterInfoObject.userBalanceDenomination,
                nodeInformation,
                masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
              ),
            )}
          />

          <CustomButton
            buttonStyles={{
              ...CENTER,

              width: 'auto',
            }}
            textContent={'Purchase'}
            actionFunction={startBitcoinPurchase}
          />
        </>
      )}
    </View>
  );

  async function startBitcoinPurchase() {
    try {
      setIsLoading(true);
      const url = await buyBitcoin({
        prepareResponse: prepareResponse,
      });
      navigate.goBack();
      await WebBrowser.openBrowserAsync(url);
    } catch (err) {
      console.log(err, 'OPENING LINK ERROR');
    }
  }
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
