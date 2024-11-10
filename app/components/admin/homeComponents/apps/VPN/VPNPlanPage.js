import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import {useEffect, useMemo, useRef, useState} from 'react';
import axios from 'axios';
import {CENTER, COLORS, FONT, SIZES} from '../../../../../constants';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import VPNDurationSlider from './components/durationSlider';
import CustomButton from '../../../../../functions/CustomElements/button';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';
import {useNavigation} from '@react-navigation/native';
import {
  ReportIssueRequestVariant,
  parseInput,
  reportIssue,
  sendPayment,
} from '@breeztech/react-native-breez-sdk';
import {
  LIGHTNINGAMOUNTBUFFER,
  LIQUIDAMOUTBUFFER,
  SATSPERBITCOIN,
} from '../../../../../constants/math';
import {getBoltzWsUrl} from '../../../../../functions/boltz/boltzEndpoitns';
import handleSubmarineClaimWSS from '../../../../../functions/boltz/handle-submarine-claim-wss';
import {useWebView} from '../../../../../../context-store/webViewContext';

import createLiquidToLNSwap from '../../../../../functions/boltz/liquidToLNSwap';
import {sendLiquidTransaction} from '../../../../../functions/liquidWallet';
import GeneratedFile from './pages/generatedFile';
import {getPublicKey} from 'nostr-tools';
import {encriptMessage} from '../../../../../functions/messaging/encodingAndDecodingMessages';
import {useGlobalAppData} from '../../../../../../context-store/appData';
import GetThemeColors from '../../../../../hooks/themeColors';

export default function VPNPlanPage() {
  const [contriesList, setCountriesList] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const numConfirmTries = useRef(0);
  const {nodeInformation, liquidNodeInformation, contactsPrivateKey} =
    useGlobalContextProvider();
  const {decodedVPNS, toggleGlobalAppDataInformation} = useGlobalAppData();
  const [selectedDuration, setSelectedDuration] = useState('week');
  const [isPaying, setIsPaying] = useState(false);
  const [generatedFile, setGeneratedFile] = useState(null);
  const publicKey = getPublicKey(contactsPrivateKey);
  const [error, setError] = useState('');
  const navigate = useNavigation();
  const {webViewRef} = useWebView();
  const {textColor, textInputBackground, textInputColor} = GetThemeColors();

  useEffect(() => {
    (async () => {
      setCountriesList(
        (await axios.get('https://lnvpn.net/api/v1/countryList')).data,
      );
    })();
  }, []);

  const countryElements = useMemo(() => {
    return [...contriesList]
      .filter(item =>
        item.country
          .slice(5)
          .toLowerCase()
          .startsWith(searchInput.toLocaleLowerCase()),
      )
      .map(item => {
        console.log(item);
        if (item.cc === 2) return <View key={item.country} />;
        return (
          <TouchableOpacity
            onPress={() => {
              setSearchInput(item.country);
            }}
            style={styles.countryElementPadding}
            key={item.country}>
            <ThemeText styles={{textAlign: 'center'}} content={item.country} />
          </TouchableOpacity>
        );
      });
  }, [searchInput, contriesList]);

  return (
    <>
      {isPaying ? (
        <>
          {generatedFile ? (
            <GeneratedFile generatedFile={generatedFile} />
          ) : (
            <FullLoadingScreen
              textStyles={{
                color: error ? COLORS.cancelRed : textColor,
              }}
              text={error || 'Generating VPN file'}
            />
          )}
        </>
      ) : (
        <View style={{flex: 1}}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            style={{flex: 1}}>
            <VPNDurationSlider
              setSelectedDuration={setSelectedDuration}
              selectedDuration={selectedDuration}
            />
            <View style={{flex: 1, marginTop: 10}}>
              <View
                style={{
                  flex: 1,
                  // paddingBottom: 10,
                }}>
                <TextInput
                  onChangeText={setSearchInput}
                  value={searchInput}
                  placeholder="United States"
                  placeholderTextColor={COLORS.opaicityGray}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: textInputBackground,
                      color: textInputColor,
                    },
                  ]}
                />
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{paddingTop: 10}}>
                  {countryElements}
                </ScrollView>
              </View>

              <CustomButton
                buttonStyles={{marginTop: 'auto', width: 'auto', ...CENTER}}
                textContent={'Create VPN'}
                actionFunction={() => {
                  const didAddLocation = contriesList.filter(item => {
                    return item.country === searchInput;
                  });

                  if (didAddLocation.length === 0) {
                    navigate.navigate('ErrorScreen', {
                      errorMessage: `Please select a country for the VPN to be located in`,
                    });
                    setIsPaying(false);
                    return;
                  }

                  const [{cc, country}] = didAddLocation;

                  const cost = Math.round(
                    (SATSPERBITCOIN / nodeInformation.fiatStats.value) *
                      (selectedDuration === 'week'
                        ? 1.5
                        : selectedDuration === 'month'
                        ? 4
                        : 9),
                  );

                  navigate.navigate('CustomHalfModal', {
                    wantedContent: 'confirmVPN',
                    country: country,
                    duration: selectedDuration,
                    createVPN: createVPN,
                    price: cost,
                    // pageContanet: (
                    //   <ConfirmSMSPayment
                    //     prices={SMSprices}
                    //     phoneNumber={phoneNumber}
                    //     areaCodeNum={selectedAreaCode[0].cc}
                    //     sendTextMessage={sendTextMessage}
                    //     page={'sendSMS'}
                    //   />
                    // ),
                    sliderHight: 0.5,
                  });

                  // navigate.navigate('ConfirmVPNPage', {
                  //   country: country,
                  //   duratoin: selectedDuration,
                  //   createVPN: createVPN,
                  //   price: cost,
                  // });
                }}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </>
  );

  async function createVPN() {
    setIsPaying(true);
    let savedVPNConfigs = JSON.parse(JSON.stringify(decodedVPNS));
    console.log(savedVPNConfigs);

    const [{cc, country}] = contriesList.filter(item => {
      return item.country === searchInput;
    });

    console.log(
      selectedDuration,
      selectedDuration === 'week'
        ? '1'
        : selectedDuration === 'month'
        ? '4'
        : '9',
    );
    try {
      const invoice = (
        await axios.post(
          'https://lnvpn.net/api/v1/getInvoice?ref=BlitzWallet',
          new URLSearchParams({
            duration:
              selectedDuration === 'week'
                ? 1.5
                : selectedDuration === 'month'
                ? 4
                : 9,
          }).toString(), // Data for 'application/x-www-form-urlencoded'
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
      ).data;

      if (invoice.payment_hash && invoice.payment_request) {
        // let savedRequests =
        //   JSON.parse(await getLocalStorageItem('savedVPNIds')) || [];

        savedVPNConfigs.push({
          payment_hash: invoice.payment_hash,
          payment_request: invoice.payment_request,
          createdTime: new Date(),
          duration: selectedDuration,
          country: country,
        });

        // setLocalStorageItem('savedVPNIds', JSON.stringify(savedRequests));
        const parsedInput = await parseInput(invoice.payment_request);
        const sendingAmountSat = parsedInput.invoice.amountMsat / 1000;

        if (
          nodeInformation.userBalance >=
          sendingAmountSat + LIGHTNINGAMOUNTBUFFER
        ) {
          try {
            await sendPayment({
              bolt11: invoice.payment_request,
              useTrampoline: false,
            });
            getVPNConfig({
              paymentHash: invoice.payment_hash,
              location: cc,
              savedVPNConfigs,
            });
          } catch (err) {
            try {
              navigate.navigate('ErrorScreen', {
                errorMessage: 'Error paying with lightning',
              });
              setIsPaying(false);
              const paymentHash = parsedInput.invoice.paymentHash;
              await reportIssue({
                type: ReportIssueRequestVariant.PAYMENT_FAILURE,
                data: {paymentHash},
              });
            } catch (err) {
              console.log(err);
            }
          }
        } else if (
          liquidNodeInformation.userBalance >=
          sendingAmountSat + LIQUIDAMOUTBUFFER
        ) {
          const {swapInfo, privateKey} = await createLiquidToLNSwap(
            invoice.payment_request,
          );

          if (!swapInfo?.expectedAmount || !swapInfo?.address) {
            navigate.navigate('ErrorScreen', {
              errorMessage: 'Error paying with liquid',
            });
            setIsPaying(false);
            return;
          }

          const refundJSON = {
            id: swapInfo.id,
            asset: 'L-BTC',
            version: 3,
            privateKey: privateKey,
            blindingKey: swapInfo.blindingKey,
            claimPublicKey: swapInfo.claimPublicKey,
            timeoutBlockHeight: swapInfo.timeoutBlockHeight,
            swapTree: swapInfo.swapTree,
          };

          const webSocket = new WebSocket(
            `${getBoltzWsUrl(process.env.BOLTZ_ENVIRONMENT)}`,
          );

          const didHandle = await handleSubmarineClaimWSS({
            ref: webViewRef,
            webSocket: webSocket,
            invoiceAddress: invoice.payment_request,
            swapInfo,
            privateKey,
            toggleMasterInfoObject: null,
            masterInfoObject: null,
            contactsPrivateKey,
            refundJSON,
            navigate,
            handleFunction: () =>
              getVPNConfig({
                paymentHash: invoice.payment_hash,
                location: cc,
                savedVPNConfigs,
              }),
            page: 'VPN',
          });
          if (didHandle) {
            const didSend = await sendLiquidTransaction(
              swapInfo.expectedAmount,
              swapInfo.address,
            );

            if (!didSend) {
              webSocket.close();
              navigate.navigate('ErrorScreen', {
                errorMessage: 'Error sending liquid payment',
              });
              setIsPaying(false);
            }
          }
        } else {
          navigate.navigate('ErrorScreen', {errorMessage: 'Not enough funds.'});
          setIsPaying(false);
        }
      } else {
        navigate.navigate('ErrorScreen', {
          errorMessage: 'Error creating invoice',
        });
        setIsPaying(false);
      }
    } catch (err) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Error paying invoice',
      });
      setIsPaying(false);
    }
  }

  async function getVPNConfig({paymentHash, location, savedVPNConfigs}) {
    if (numConfirmTries.current > 4) {
      saveVPNConfigsToDB(savedVPNConfigs);
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Not able to get config file',
      });
      return;
    }
    try {
      const VPNInfo = (
        await axios.post(
          'https://lnvpn.net/api/v1/getTunnelConfig?ref=BlitzWallet',
          new URLSearchParams({
            paymentHash: paymentHash,
            location: `${location}`,
          }).toString(), // Data for 'application/x-www-form-urlencoded'
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
      ).data;

      if (VPNInfo.WireguardConfig) {
        setGeneratedFile(VPNInfo.WireguardConfig);

        // let savedRequests =
        //   JSON.parse(await getLocalStorageItem('savedVPNIds')) || [];

        const updatedList = savedVPNConfigs.map(item => {
          if (item.payment_hash === paymentHash) {
            return {...item, config: VPNInfo.WireguardConfig};
          } else return item;
        });
        saveVPNConfigsToDB(updatedList);
        // setLocalStorageItem('savedVPNIds', JSON.stringify(updatedList));
      } else {
        setTimeout(() => {
          numConfirmTries.current = numConfirmTries.current + 1;
          console.log(numConfirmTries.current);
          getVPNConfig({
            paymentHash,
            location,
            savedVPNConfigs,
          });
        }, 5000);
      }
    } catch (err) {
      console.log(err);
      setTimeout(() => {
        numConfirmTries.current = numConfirmTries.current + 1;
        console.log(numConfirmTries.current);
        getVPNConfig({
          paymentHash,
          location,
          savedVPNConfigs,
        });
      }, 5000);
    }
  }

  async function saveVPNConfigsToDB(configList) {
    const em = encriptMessage(
      contactsPrivateKey,
      publicKey,
      JSON.stringify(configList),
    );

    toggleGlobalAppDataInformation({VPNplans: em}, true);
  }
}

const styles = StyleSheet.create({
  textInput: {
    width: '100%',
    padding: 10,
    ...CENTER,
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    borderRadius: 8,
    // marginBottom: 20,
    includeFontPadding: false,
  },
  qrCodeContainer: {
    width: 300,
    height: 'auto',
    minHeight: 300,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countryElementPadding: {paddingVertical: 10},
});
