import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../constants';
import {useNavigation} from '@react-navigation/native';

import handleBackPress from '../../hooks/handleBackPress';
import {useCallback, useEffect, useRef} from 'react';
import {HalfModalSendOptions} from '../../components/admin';
import {
  ConfirmSMSPayment,
  ConfirmVPNPage,
} from '../../components/admin/homeComponents/apps';
import ThemeText from './textTheme';
import ConfirmGiftCardPurchase from '../../components/admin/homeComponents/apps/giftCards/confimPurchase';
import ConfirmExportPayments from '../../components/admin/homeComponents/exportTransactions/exportTracker';
import ConfirmChatGPTPage from '../../components/admin/homeComponents/apps/chatGPT/components/confirmationPage';

export default function CustomHalfModal(props) {
  const navigate = useNavigation();

  const contentType = props?.route?.params?.wantedContent;
  const slideHeight = props?.route?.params?.sliderHight || 0.5;

  console.log(contentType);

  const windowDimensions = useWindowDimensions();

  const handleBackPressFunction = useCallback(() => {
    slideOut();
    setTimeout(() => {
      navigate.goBack();
    }, 200);
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
    setTimeout(() => {
      slideIn();
    }, 100);
  }, [handleBackPressFunction]);

  const slideIn = () => {
    Animated.timing(translateY, {
      toValue: windowDimensions.height - windowDimensions.height * slideHeight,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const slideOut = () => {
    Animated.timing(translateY, {
      toValue: windowDimensions.height,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const translateY = useRef(
    new Animated.Value(windowDimensions.height),
  ).current;

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        slideOut();
        setTimeout(() => {
          navigate.goBack();
        }, 200);
      }}>
      <View style={styles.contentContainer}>
        <Animated.View style={{marginTop: translateY}}>
          {contentType === 'sendOptions' ? (
            <HalfModalSendOptions slideHeight={slideHeight} />
          ) : contentType === 'confirmSMS' ? (
            <ConfirmSMSPayment
              prices={props.route.params?.prices}
              phoneNumber={props.route.params?.phoneNumber}
              areaCodeNum={props.route.params?.areaCodeNum}
              sendTextMessage={props.route.params?.sendTextMessage}
              page={'sendSMS'}
            />
          ) : contentType === 'confirmVPN' ? (
            <ConfirmVPNPage
              price={props.route.params?.price}
              duration={props.route.params?.duration}
              country={props.route.params?.country}
              createVPN={props.route.params?.createVPN}
              slideHeight={slideHeight}
            />
          ) : contentType === 'giftCardConfirm' ? (
            <ConfirmGiftCardPurchase
              quantity={props.route.params?.quantity}
              price={props.route.params?.price}
              productId={props.route.params?.productId}
              purchaseGiftCard={props.route.params?.purchaseGiftCard}
            />
          ) : contentType === 'exportTransactions' ? (
            <ConfirmExportPayments />
          ) : contentType === 'chatGPT' ? (
            <ConfirmChatGPTPage
              price={props.route.params?.price}
              plan={props.route.params?.plan}
              payForPlan={props.route.params?.payForPlan}
              slideHeight={slideHeight}
            />
          ) : (
            <ThemeText content={'TST'} />
            // props?.route?.params?.pageContanet
          )}
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  contentContainer: {flex: 1, backgroundColor: COLORS.halfModalBackgroundColor},
});
