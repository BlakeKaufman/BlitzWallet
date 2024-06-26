import {
  ActivityIndicator,
  Image,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import {useGlobalContextProvider} from '../../../../../../../context-store/context';
import {
  BTN,
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SATSPERBITCOIN,
  SIZES,
} from '../../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {
  copyToClipboard,
  formatBalanceAmount,
  numberConverter,
} from '../../../../../../functions';
import QRCode from 'react-native-qrcode-svg';
import {useEffect, useRef, useState} from 'react';
import {generateLightningAddress} from '../../../../../../functions/receiveBitcoin';

import {createLiquidReceiveAddress} from '../../../../../../functions/liquidWallet';
import WebView from 'react-native-webview';
import handleWebviewClaimMessage from '../../../../../../functions/boltz/handle-webview-claim-message';
import {
  getBoltzApiUrl,
  getBoltzWsUrl,
} from '../../../../../../functions/boltz/boltzEndpoitns';
import {useWebView} from '../../../../../../../context-store/webViewContext';
import handleReverseClaimWSS from '../../../../../../functions/boltz/handle-reverse-claim-wss';

export default function CheckoutPaymentScreen(props) {
  const {
    theme,
    nodeInformation,
    masterInfoObject,
    liquidNodeInformation,
    breezContextEvent,
  } = useGlobalContextProvider();
  const sendingAmount = props.route.params?.sendingAmount;
  const setAddedItems = props.route.params?.setAddedItems;
  const setChargeAmount = props.route.params?.setChargeAmount;
  const isInitialRender = useRef(true);
  const {webViewRef, setWebViewArgs} = useWebView();

  const satValue = Math.round(
    ((Number(sendingAmount) / 100) * SATSPERBITCOIN) /
      nodeInformation.fiatStats.value || 70000,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingLightning, setIsUsingLightning] = useState(true);

  const [addresses, setAddresses] = useState({
    lightning: '',
    liquid: '',
  });

  const [errorMessageText, setErrorMessageText] = useState('');
  const [lntoLiquidSwapInfo, setLNtoLiquidSwapInfo] = useState({});
  const [paymentConfirmationStage, setPaymentConfirmationStage] = useState({
    invoice: true,
    claiming: false,
    claimed: false,
  });

  const Dimensions = useWindowDimensions();
  const navigate = useNavigation();

  useEffect(() => {
    (async () => {
      const response = await generateLightningAddress(
        nodeInformation,
        masterInfoObject.userBalanceDenomination,
        satValue,
        'BW-POS',
        setIsLoading,
        masterInfoObject,
      );

      const liquidAddrsss = await createLiquidReceiveAddress();

      if (!response.receiveAddress || !liquidAddrsss?.address) return;
      if (response.errorMessage.type === 'stop') {
        setErrorMessageText(response.errorMessage);
        return;
      } else if (response.errorMessage.type === 'warning')
        setErrorMessageText(response.errorMessage);

      if (response.data) {
        setLNtoLiquidSwapInfo(response.data);
      }

      console.log(response);

      setAddresses({
        lightning:
          response.errorMessage.type === 'stop' ? '' : response.receiveAddress,

        liquid: liquidAddrsss.address,
      });
    })();
  }, []);

  console.log(isLoading, isUsingLightning, addresses.lightning);
  useEffect(() => {
    (async () => {
      if (!lntoLiquidSwapInfo?.initSwapInfo?.id) return;

      console.log(lntoLiquidSwapInfo?.initSwapInfo?.id);

      const webSocket = new WebSocket(
        `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
      );

      setWebViewArgs({
        navigate: navigate,
        page: 'POS',
        function: setPaymentConfirmationStage,
      });

      handleReverseClaimWSS({
        ref: webViewRef,
        webSocket,
        liquidAddress: lntoLiquidSwapInfo.liquidAddress,
        swapInfo: lntoLiquidSwapInfo.initSwapInfo,
        preimage: lntoLiquidSwapInfo.preimage,
        privateKey: lntoLiquidSwapInfo.keys.privateKey.toString('hex'),
        navigate,
        isReceivingSwapFunc: setPaymentConfirmationStage,
        fromPage: 'POS',
      });
    })();
  }, [lntoLiquidSwapInfo]);

  useEffect(() => {
    if (!isInitialRender.current) return;
    console.log('LISTEN FOR LN PAYMNET');
    console.log(breezContextEvent?.details?.payment?.description);
    if (breezContextEvent?.details?.payment?.description === 'BW-POS') {
      setPaymentConfirmationStage({
        invoice: false,
        claiming: false,
        claimed: true,
      });
    }
  }, [breezContextEvent]);

  return (
    <View
      style={{
        backgroundColor: COLORS.opaicityGray,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View
        style={{
          width: '80%',
          backgroundColor: paymentConfirmationStage.claimed
            ? COLORS.nostrGreen
            : theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          padding: 10,
          borderRadius: 8,
        }}>
        {paymentConfirmationStage.invoice && (
          <>
            <View
              style={{
                marginTop: 10,
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'space-between',
              }}>
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: FONT.Title_Regular,
                  fontSize: SIZES.large,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                }}>
                Scan to pay
              </Text>
              <View>
                <TouchableOpacity
                  onPress={() => {
                    copyToClipboard(
                      isUsingLightning ? addresses.lightning : addresses.liquid,
                      navigate,
                    );
                  }}>
                  <Image
                    style={{width: 30, height: 30}}
                    source={theme ? ICONS.clipboardLight : ICONS.clipboardDark}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {/* ///////////////////// */}

            <Text
              style={{
                textAlign: 'center',
                fontFamily: FONT.Title_Regular,
                fontSize: SIZES.medium,
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                marginBottom: -5,
              }}>
              ${(Number(sendingAmount) / 100).toFixed(2)}
            </Text>
            <Text
              style={{
                fontSize: SIZES.medium,
                textAlign: 'center',
                fontFamily: FONT.Title_Regular,
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              }}>
              {formatBalanceAmount(
                numberConverter(
                  satValue, //eventualt replace with nodeinformation.fiatStats.value
                  'sats',
                  nodeInformation,
                ),
              )}{' '}
              sats
            </Text>

            {/* //////////////////// */}
            <View
              style={{
                width: '100%',
                height: Dimensions.width * 0.7,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {isLoading ? (
                <ActivityIndicator
                  color={theme ? COLORS.darkModeText : COLORS.lightModeText}
                  size={'large'}
                />
              ) : !isLoading && isUsingLightning && addresses.lightning ? (
                <QRCode
                  style={{...CENTER}}
                  size={Dimensions.width * 0.7}
                  quietZone={20}
                  value={addresses.lightning}
                  color={theme ? COLORS.lightModeText : COLORS.darkModeText}
                  backgroundColor={
                    theme
                      ? COLORS.lightModeBackground
                      : COLORS.darkModeBackground
                  }
                />
              ) : !isLoading && !isUsingLightning && addresses.liquid ? (
                <QRCode
                  style={{...CENTER}}
                  size={Dimensions.width * 0.7}
                  quietZone={20}
                  value={addresses.liquid}
                  color={theme ? COLORS.lightModeText : COLORS.darkModeText}
                  backgroundColor={
                    theme
                      ? COLORS.lightModeBackground
                      : COLORS.darkModeBackground
                  }
                />
              ) : (
                <ActivityIndicator
                  color={theme ? COLORS.darkModeText : COLORS.lightModeText}
                  size={'large'}
                />
              )}
            </View>

            <Text
              style={{
                textAlign: 'center',
                fontFamily: FONT.Title_Regular,
                fontSize: SIZES.medium,
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                marginTop: 5,
              }}>
              {isUsingLightning ? errorMessageText.text : ''}
            </Text>

            <View
              style={{
                width: '80%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                ...CENTER,
                marginTop: 20,
                marginBottom: 20,
              }}>
              <TouchableOpacity
                onPress={() => {
                  setAddedItems([]);
                  setChargeAmount(0);
                  navigate.goBack();
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontFamily: FONT.Title_Regular,
                    fontSize: SIZES.medium,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    marginTop: 5,
                    textTransform: 'uppercase',
                  }}>
                  Clear Sale
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={navigate.goBack}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontFamily: FONT.Title_Regular,
                    fontSize: SIZES.medium,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    marginTop: 5,
                    textTransform: 'uppercase',
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontFamily: FONT.Title_Regular,
                  fontSize: SIZES.medium,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                }}>
                Liquid
              </Text>
              <Switch
                style={{marginRight: 10, marginLeft: 10}}
                trackColor={{
                  true: COLORS.primary,
                  false: COLORS.primary,
                }}
                onChange={e => {
                  setIsUsingLightning(prev => !prev);
                }}
                value={isUsingLightning}
              />
              <Text
                style={{
                  textAlign: 'center',
                  fontFamily: FONT.Title_Regular,
                  fontSize: SIZES.medium,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                }}>
                Lightning
              </Text>
            </View>
          </>
        )}
        {(paymentConfirmationStage.claiming ||
          paymentConfirmationStage.claimed) && (
          <View>
            {paymentConfirmationStage.claiming ? (
              <View style={{paddingVertical: 50}}>
                <ActivityIndicator
                  size={'large'}
                  color={theme ? COLORS.darkModeText : COLORS.lightModeText}
                />
                <Text
                  style={{
                    textAlign: 'center',
                    fontFamily: FONT.Title_Regular,
                    fontSize: SIZES.large,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    marginTop: 20,
                  }}>
                  Claiming Payment
                </Text>
              </View>
            ) : (
              <View style={{alignItems: 'center', paddingTop: 50}}>
                <Image
                  style={{
                    width: 175,
                    height: 175,
                  }}
                  source={ICONS.CheckcircleLight}
                />
                <TouchableOpacity
                  onPress={() => {
                    setAddedItems([]);
                    setChargeAmount(0);
                    navigate.goBack();
                  }}
                  style={[BTN, {backgroundColor: COLORS.darkModeText}]}>
                  <Text
                    style={{
                      fontFamily: FONT.Title_Regular,
                      fontSize: SIZES.large,
                      color: COLORS.lightModeText,
                    }}>
                    Continue
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
