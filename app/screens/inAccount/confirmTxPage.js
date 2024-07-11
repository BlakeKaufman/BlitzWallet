import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import {BTN, COLORS, FONT, ICONS, SIZES} from '../../constants';

import {useNavigation} from '@react-navigation/native';

import {useGlobalContextProvider} from '../../../context-store/context';
import {useEffect, useRef, useState} from 'react';
import {GlobalThemeView, ThemeText} from '../../functions/CustomElements';
import handleBackPress from '../../hooks/handleBackPress';
import Svg, {Circle, Path} from 'react-native-svg';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
export default function ConfirmTxPage(props) {
  const navigate = useNavigation();

  const animatedBackground = useRef(new Animated.Value(0)).current;
  const animatedValue = useRef(new Animated.Value(0)).current;
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2 * Math.PI * 45, 0],
  });
  const checkMarkLength = 150;
  const checkMarkDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [checkMarkLength, 0],
  });
  const xLength = 60; // Approximate length of the 'X' path
  const xDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [xLength, 0],
  });

  const [showContinueBTN, setShowContinueBTN] = useState(false);

  const windowDimensions = Dimensions.get('window');
  const {masterInfoObject, toggleMasterInfoObject} = useGlobalContextProvider();
  const paymentType = props.route.params?.for;
  const paymentInformation = props.route.params?.information;
  //   const didCompleteIcon =
  //     paymentType?.toLowerCase() != 'paymentfailed'
  //       ? ICONS.CheckcircleLight
  //       : ICONS.XcircleLight;

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  // console.log(paymentResponse.payment.paymentType === 'paymentFailed');

  // if (paymentResponse.payment.paymentType === 'paymentFailed') {
  //   const savedFailedPayments = JSON.parse(
  //     await getLocalStorageItem('failedTxs'),
  //   );

  // } ADD THIS CODE TO MAKE SURE I ADD FAILED TX TO THE LIST OF TRASACTIONS

  useEffect(() => {
    try {
      if (paymentType === 'paymentFailed') {
        let savedFailedPayments = masterInfoObject.failedTransactions;

        savedFailedPayments.push(paymentInformation);

        toggleMasterInfoObject({
          failedTransactions: savedFailedPayments,
        });
      }
      // else if (
      //   paymentInformation?.details?.payment?.description != 'Liquid Swap'
      // )
      //   return;
      //   try {
      //     let prevSwapInfo = masterInfoObject.failedLiquidSwaps;

      //     prevSwapInfo.pop();

      //     toggleMasterInfoObject({failedLiquidSwaps: prevSwapInfo});
      //   } catch (err) {
      //     console.log(err);
      //   }
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    Animated.timing(animatedBackground, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    setTimeout(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }, 200);

    setTimeout(() => {
      setShowContinueBTN(true);
    }, 800);
  }, []);

  return (
    <GlobalThemeView
      styles={{
        flex: 1,
        backgroundColor: 'transparent',

        alignItems: 'center',
      }}>
      <Animated.View
        style={{
          position: 'absolute',
          top: windowDimensions.height / 3 - 100,
          left: windowDimensions.width / 2 - 100,

          backgroundColor:
            paymentType?.toLowerCase() != 'paymentfailed'
              ? COLORS.nostrGreen
              : COLORS.cancelRed,
          width: 200,
          height: 200,
          borderRadius: 100,
          transform: [
            {perspective: 500},
            {
              scale: animatedBackground.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 30],
              }),
            },
          ],
        }}></Animated.View>

      <View
        style={{
          position: 'absolute',
          top: windowDimensions.height / 3 - 100,
          left: windowDimensions.width / 2 - 100,
        }}>
        <Svg height="200" width="200" viewBox="0 0 100 100">
          {paymentType?.toLowerCase() != 'paymentfailed' ? (
            <AnimatedPath
              d="M30 50 L45 65 L70 35" // Check mark path
              stroke={COLORS.darkModeText}
              strokeWidth="5"
              fill="none"
              strokeDasharray={checkMarkLength}
              strokeDashoffset={checkMarkDashoffset}
            />
          ) : (
            <>
              <AnimatedPath
                d="M30 30 L70 70" // First line of 'X'
                stroke={COLORS.darkModeText}
                strokeWidth="5"
                fill="none"
                strokeDasharray={xLength}
                strokeDashoffset={xDashoffset}
              />
              <AnimatedPath
                d="M70 30 L30 70" // Second line of 'X'
                stroke={COLORS.darkModeText}
                strokeWidth="5"
                fill="none"
                strokeDasharray={xLength}
                strokeDashoffset={xDashoffset}
              />
            </>
          )}
          <AnimatedCircle
            cx="50"
            cy="50"
            r="45"
            stroke={COLORS.darkModeText}
            strokeWidth="5"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={strokeDashoffset}
          />
        </Svg>
      </View>

      {showContinueBTN && (
        <>
          <TouchableOpacity
            onPress={() => {
              navigate.navigate('HomeAdmin');
            }}
            style={[
              BTN,
              {
                height: 'auto',
                width: 'auto',
                backgroundColor: COLORS.darkModeText,
                marginTop: 'auto',
                paddingVertical: 8,
                paddingHorizontal: 30,
              },
            ]}>
            <Text
              style={[
                styles.buttonText,
                {
                  color:
                    paymentType?.toLowerCase() != 'paymentfailed'
                      ? COLORS.nostrGreen
                      : COLORS.cancelRed,
                },
              ]}>
              Continue
            </Text>
          </TouchableOpacity>

          {paymentType?.toLowerCase() != 'paymentfailed' && (
            <Text
              style={[
                styles.paymentConfirmedMessage,
                {color: COLORS.darkModeText},
              ]}>
              {`Your payment has been ${
                paymentType?.toLowerCase() === 'paymentsucceed'
                  ? 'sent'
                  : 'received'
              }, and your balance will be updated shortly!`}
            </Text>
          )}
        </>
      )}
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.large,
  },
  paymentConfirmedMessage: {
    width: '90%',
    fontSize: SIZES.medium,

    fontFamily: FONT.Title_Regular,
    textAlign: 'center',
    marginTop: 20,
  },
});
