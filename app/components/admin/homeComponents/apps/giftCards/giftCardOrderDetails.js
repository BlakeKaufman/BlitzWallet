import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import {useCallback, useEffect} from 'react';
import GetThemeColors from '../../../../../hooks/themeColors';
import handleBackPress from '../../../../../hooks/handleBackPress';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {CENTER, COLORS, FONT, SIZES} from '../../../../../constants';
import {ThemeText} from '../../../../../functions/CustomElements';
import {copyToClipboard} from '../../../../../functions';
import CustomButton from '../../../../../functions/CustomElements/button';
import {openInbox} from 'react-native-email-link';

export default function GiftCardOrderDetails(props) {
  const {backgroundColor} = GetThemeColors();

  const item = props.route.params?.item;
  const navigate = useNavigation();

  const handleBackPressFunction = useCallback(() => {
    navigate.goBack();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  return (
    <TouchableWithoutFeedback onPress={() => navigate.goBack()}>
      <View style={styles.globalContainer}>
        <TouchableWithoutFeedback>
          <View
            style={[
              styles.content,
              {
                backgroundColor: backgroundColor,
              },
            ]}>
            <ThemeText styles={styles.headerText} content={'Order Details'} />

            <ThemeText styles={styles.itemDescription} content={'Invoice'} />
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                copyToClipboard(item.invoice, navigate);
              }}>
              <ThemeText content={`${item.invoice.slice(0, 50)}...`} />
            </TouchableOpacity>
            <ThemeText styles={styles.itemDescription} content={'Order ID'} />
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                copyToClipboard(JSON.stringify(item.id), navigate);
              }}>
              <ThemeText content={item.id} />
            </TouchableOpacity>
            <ThemeText styles={styles.itemDescription} content={'UUID'} />
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                copyToClipboard(item.uuid, navigate);
              }}>
              <ThemeText content={item.uuid} />
            </TouchableOpacity>
            <CustomButton
              buttonStyles={{
                // marginBottom: 10,
                width: 'auto',
                ...CENTER,
              }}
              actionFunction={async () => {
                try {
                  await openInbox();
                } catch (err) {
                  navigate.navigate('ErrorScreen', {
                    errorMessage: 'Not able to find any mail apps',
                  });
                }
              }}
              textContent={'Open inbox'}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    backgroundColor: COLORS.halfModalBackgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '95%',
    maxWidth: 300,
    backgroundColor: COLORS.lightModeBackground,

    // paddingVertical: 10,
    borderRadius: 8,
    padding: 10,
  },
  headerText: {
    fontSize: SIZES.large,
    textAlign: 'center',
  },
  itemContainer: {
    marginBottom: 10,
  },
  itemDescription: {
    fontWeight: 500,
  },
});
