import {nodeInfo} from '@breeztech/react-native-breez-sdk';
import {CENTER, COLORS} from '../../../../constants';
import {StyleSheet, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {createLiquidReceiveAddress} from '../../../../functions/liquidWallet';
import {useEffect} from 'react';

export default function LiquidPage(props) {
  useEffect(() => {
    (async () => {
      const liquidAddress = await createLiquidReceiveAddress();
      console.log(liquidAddress);

      props.setGeneratedAddress(liquidAddress.address);
    })();
  }, []);

  return (
    <View style={[styles.container]}>
      <View style={[styles.qrcodeContainer]}>
        <QRCode
          size={250}
          value={
            props.generatedAddress.liquid
              ? props.generatedAddress.liquid
              : 'lets swap'
          }
          color={props.theme ? COLORS.darkModeText : COLORS.lightModeText}
          backgroundColor={
            props.theme ? COLORS.darkModeBackground : COLORS.lightModeBackground
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  //
  qrcodeContainer: {
    width: '90%',
    maxWidth: 250,
    height: 250,
    ...CENTER,

    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
});
