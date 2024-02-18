import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import {
  COLORS,
  FONT,
  ICONS,
  SIZES,
  CENTER,
  SHADOWS,
} from '../../../../../constants';

export default function EnterAmount(props) {
  return (
    <>
      <View
        style={[
          styles.inputContainer,
          {
            marginTop: 'auto',
            backgroundColor: props.theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
            borderColor: props.theme
              ? COLORS.darkModeText
              : COLORS.lightModeText,
          },
        ]}>
        <View style={styles.labelContainer}>
          <Image
            style={{width: 30, height: 30, marginRight: 5}}
            source={ICONS.liquidIcon}
          />
          <Text style={styles.labelText}>Liquid</Text>
        </View>

        <TextInput
          style={[
            styles.inputField,
            {
              color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}
          keyboardType="number-pad"
          onChangeText={props.setLiquidAmount}
          value={props.liquidAmount}
        />
      </View>
      <View style={styles.feeContainer}>
        <View style={[styles.feeRow, {marginBottom: 5}]}>
          <Text
            style={[
              styles.feeLabel,
              {
                color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            Network Fee
          </Text>
          <Text
            style={[
              styles.feeText,
              {
                color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            {props.feeInfo.liquidFee}
          </Text>
        </View>
        <View style={styles.feeRow}>
          <Text
            style={[
              styles.feeLabel,
              {
                color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            Boltz Fee (0.1%)
          </Text>
          <Text
            style={[
              styles.feeText,
              {
                color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            {(props.feeInfo.boltzFeePercent * props.liquidAmount).toFixed(2)}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: COLORS.opaicityGray,
            borderColor: props.theme
              ? COLORS.darkModeText
              : COLORS.lightModeText,
          },
        ]}>
        <View style={styles.labelContainer}>
          <Image
            style={{width: 30, height: 30, marginRight: 5}}
            source={ICONS.lightningIcon}
          />
          <Text style={styles.labelText}>Lightning</Text>
        </View>
        <View
          style={{
            height: '100%',
            width: 'auto',
            justifyContent: 'center',
          }}>
          <Text style={[styles.inputField, {width: 'auto', height: 'auto'}]}>
            {props.liquidAmount -
              props.feeInfo.liquidFee -
              props.liquidAmount * props.feeInfo.boltzFeePercent}
          </Text>
        </View>
      </View>
      <Text style={styles.disclaimerText}>All values are in sats</Text>
      <TouchableOpacity
        onPress={() => {
          if (
            props.liquidAmount > props.feeInfo.maxAmount ||
            props.liquidAmount < props.feeInfo.minAmount
          )
            return;
          props.setProcessStage(prev => {
            return {...prev, amount: false, qrCode: true};
          });
          props.setIsSwapCreated(true);
        }}
        style={[
          styles.createSwapBTN,
          {
            opacity:
              props.liquidAmount > props.feeInfo.maxAmount ||
              props.liquidAmount < props.feeInfo.minAmount
                ? 0.4
                : 1,
            marginBottom: 40,
          },
        ]}>
        <Text style={styles.buttonText}>Create swap</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    width: '90%',
    height: 55,
    position: 'relative',
    borderWidth: 1,
    borderRadius: 8,
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelContainer: {
    width: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 5,
    paddingRight: 10,
    borderRadius: 8,
  },
  labelText: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontFamily: FONT.Title_Bold,
  },
  inputField: {
    width: '50%',
    height: '100%',
    textAlign: 'right',
    fontSize: SIZES.large,
    fontFamily: FONT.Descriptoin_Regular,

    padding: 0,
  },
  feeContainer: {
    width: '90%',
    alignItems: 'flex-end',
    marginVertical: 20,
    paddingRight: 10,
  },
  feeRow: {
    flexDirection: 'row',
  },
  feeLabel: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Bold,
    marginRight: 10,
  },
  feeText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Descriptoin_Regular,
  },
  disclaimerText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    color: COLORS.cancelRed,
    marginTop: 10,
  },

  createSwapBTN: {
    height: 40,
    width: 200,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    // overflow: "hidden",
    ...SHADOWS.medium,
    marginTop: 'auto',
    // marginBottom: 30,
  },
  buttonText: {
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.medium,
    color: COLORS.background,
  },

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
