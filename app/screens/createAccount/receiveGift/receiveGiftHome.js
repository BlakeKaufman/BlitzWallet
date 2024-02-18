import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Back_BTN} from '../../../components/login';
import {useNavigation} from '@react-navigation/native';
import {Background, COLORS, FONT, SIZES} from '../../../constants';
import {useEffect, useState} from 'react';
import QRCode from 'react-native-qrcode-svg';
import {
  connectToNode,
  generateMnemnoic,
  retrieveData,
  storeData,
} from '../../../functions';
import {nodeInfo, openChannelFee} from '@breeztech/react-native-breez-sdk';

export default function ReceiveGiftHome({navigation: {navigate}}) {
  const [setupSteps, setSetupSteps] = useState({
    generatingSeed: true,
    connectingToNode: false,
    calculatingFees: false,
    settingUpQrCode: false,
    showingQrCode: false,
  });
  const [errorText, setErrorText] = useState('');
  const [qrCodeObject, setQrCodeObject] = useState({
    channelOpenFee: 0,
    nodeId: '',
  });
  const [openChannelFeeDisplay, setOpenChannelFeeDisplay] = useState({});

  useEffect(() => {
    initalizeProcess();
  }, []);

  return (
    <View
      style={[Background, {paddingVertical: Platform.OS === 'ios' ? 0 : 10}]}>
      <SafeAreaView style={{flex: 1}}>
        <Back_BTN navigation={navigate} destination="Home" />
        <View style={{flex: 1}}>
          {!setupSteps.showingQrCode ? (
            <View
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <Text
                style={{fontFamily: FONT.Title_Bold, fontSize: SIZES.large}}>
                {setupSteps.generatingSeed
                  ? 'Generating Seed Phrase'
                  : setupSteps.connectingToNode
                  ? 'Connecting to node'
                  : setupSteps.calculatingFees
                  ? 'Caluclating Fees'
                  : 'Preparing Qr Code'}
              </Text>
              <ActivityIndicator
                size="large"
                color={COLORS.lightModeText}
                style={{marginVertical: 20}}
              />
              <Text
                style={{
                  fontFamily: FONT.Descriptoin_Regular,
                  fontSize: SIZES.medium,
                  marginTop: 10,
                  color: COLORS.cancelRed,
                }}>
                {errorText ? errorText : ' '}
              </Text>
            </View>
          ) : (
            <View
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <Text
                style={{
                  width: '95%',
                  fontFamily: FONT.Title_Bold,
                  fontSize: SIZES.large,
                  color: COLORS.lightModeText,
                  marginBottom: 20,
                  textAlign: 'center',
                }}>
                Scan from blitz wallet send gift page in settings!
              </Text>
              <QRCode
                size={250}
                value={qrCodeObject ? JSON.stringify(qrCodeObject) : 'NULL'}
                color={COLORS.lightModeText}
                backgroundColor={COLORS.lightModeBackground}
              />
              <View style={{width: 260, marginTop: 30}}>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      fontFamily: FONT.Title_Regular,
                      fontSize: SIZES.medium,
                      color: COLORS.lightModeText,
                    }}>
                    Minumum gift amount (sats)
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONT.Descriptoin_Regular,
                      color: COLORS.primary,
                    }}>
                    {openChannelFeeDisplay?.usedFeeParams?.minMsat
                      ? (
                          openChannelFeeDisplay?.usedFeeParams?.minMsat / 1000
                        ).toLocaleString()
                      : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );

  async function initalizeProcess() {
    if (await retrieveData('mnemonic')) {
      setSetupSteps({
        generatingSeed: false,
        connectingToNode: true,
        calculatingFees: false,
        settingUpQrCode: false,
        showingQrCode: false,
      });
      localConnectToNode();
      return;
    }

    getMnemnoic();
  }

  async function getMnemnoic() {
    try {
      const mnemonic = await generateMnemnoic();
      storeData('mnemonic', mnemonic);
      setSetupSteps({
        generatingSeed: false,
        connectingToNode: true,
        calculatingFees: false,
        settingUpQrCode: false,
        showingQrCode: false,
      });
      localConnectToNode();
    } catch (err) {
      setErrorText('Not able to generate seed phase');
    }
  }

  async function localConnectToNode() {
    const response = await connectToNode(onBreezEvent);
    if (response.isConnected) {
      setSetupSteps({
        generatingSeed: false,
        connectingToNode: false,
        calculatingFees: true,
        settingUpQrCode: false,
        showingQrCode: false,
      });
      calculatingChannelOpenFee();
    } else {
      setErrorText('Not able to connect to node');
    }
  }

  function onBreezEvent(e) {
    if (e?.type != 'invoicePaid') return;
    navigate.navigate('PinSetup');
  }

  async function calculatingChannelOpenFee() {
    try {
      const amountMsat = 10000;
      const openChannelFeeResponse = await openChannelFee({
        amountMsat,
      });
      setSetupSteps({
        generatingSeed: false,
        connectingToNode: false,
        calculatingFees: false,
        settingUpQrCode: true,
        showingQrCode: false,
      });
      setOpenChannelFeeDisplay(openChannelFeeResponse);
      setQrCodeObject(prev => {
        return {...prev, channelOpenFee: openChannelFeeResponse.feeMsat};
      });
      finalizeQrCode();
    } catch (err) {
      setErrorText('Not able to calculate channel open fees');
    }
  }

  async function finalizeQrCode() {
    try {
      const nodeState = await nodeInfo();
      console.log(nodeState);
      setSetupSteps({
        generatingSeed: false,
        connectingToNode: false,
        calculatingFees: false,
        settingUpQrCode: false,
        showingQrCode: true,
      });
      setQrCodeObject(prev => {
        return {...prev, nodeId: nodeState.id};
      });
    } catch (err) {
      setErrorText('Not able to calculate channel open fees');
    }
  }
}

const styles = StyleSheet.create({});
