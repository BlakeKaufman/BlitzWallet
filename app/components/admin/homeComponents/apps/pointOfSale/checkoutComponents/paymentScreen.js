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
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SATSPERBITCOIN,
  SIZES,
} from '../../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {
  formatBalanceAmount,
  numberConverter,
} from '../../../../../../functions';
import QRCode from 'react-native-qrcode-svg';
import {useEffect, useState} from 'react';
import {generateLightningAddress} from '../../../../../../functions/receiveBitcoin';

import {createLiquidReceiveAddress} from '../../../../../../functions/liquidWallet';

export default function CheckoutPaymentScreen(props) {
  const {theme, nodeInformation, masterInfoObject} = useGlobalContextProvider();
  const sendingAmount = props.route.params?.sendingAmount;
  const setAddedItems = props.route.params?.setAddedItems;
  const setChargeAmount = props.route.params?.setChargeAmount;

  const satValue = Math.round(
    ((Number(sendingAmount) / 100) * SATSPERBITCOIN) /
      nodeInformation.fiatStats.value,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingLightning, setIsUsingLightning] = useState(true);

  const [addresses, setAddresses] = useState({
    lightning: '',
    liquid: '',
  });
  const [errorMessageText, setErrorMessageText] = useState('');
  const [lntoLiquidSwapInfo, setLNtoLiquidSwapInfo] = useState({});

  const Dimensions = useWindowDimensions();
  const navigate = useNavigation();

  useEffect(() => {
    (async () => {
      const response = await generateLightningAddress(
        nodeInformation,
        masterInfoObject.userBalanceDenomination,
        satValue,
        '',
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

      setAddresses({
        lightning: response.receiveAddress,
        liquid: liquidAddrsss.address,
      });
    })();
  }, []);

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

          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          padding: 10,
          borderRadius: 8,
        }}>
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
            <TouchableOpacity>
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
          {isLoading || (!addresses.lightning && !addresses.liquid) ? (
            <ActivityIndicator
              color={theme ? COLORS.darkModeText : COLORS.lightModeText}
              size={'large'}
            />
          ) : (
            <QRCode
              style={{...CENTER}}
              size={Dimensions.width * 0.7}
              quietZone={20}
              value={isUsingLightning ? addresses.lightning : addresses.liquid}
              color={theme ? COLORS.lightModeText : COLORS.darkModeText}
              backgroundColor={
                theme ? COLORS.lightModeBackground : COLORS.darkModeBackground
              }
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
      </View>
    </View>
  );
}
