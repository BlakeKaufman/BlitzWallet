import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import * as WebBrowser from 'expo-web-browser';
import {BTN, COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import {backArrow} from '../../../../../constants/styles';

export default function LspDescriptionPopup() {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
        },
      ]}>
      <SafeAreaView style={{flex: 1, alignItems: 'center'}}>
        <View style={styles.innerContainer}>
          <TouchableOpacity onPress={() => navigate.goBack()}>
            <Image
              style={[backArrow, {marginBottom: 20, marginLeft: 0}]}
              source={ICONS.leftCheveronIcon}
            />
          </TouchableOpacity>
          <View style={{flex: 1, width: '100%', alignItems: 'center'}}>
            <Text
              style={[
                styles.text,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  marginTop: 'auto',
                },
              ]}>
              A Lightning Service Provider (LSP) is a business that enables a
              more seamless experience on the Lightning Network. Such services
              include providing liquidity management and payment routing.
            </Text>
            <Text
              style={[
                styles.text,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Since the Lightning Network worked based on a series of channels
              the size of a Lightning channel is naturally constrained. Using an
              LSP decreases that constraint making larger payments more
              feasible.
            </Text>
            <Text
              style={[
                styles.text,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  marginBottom: 'auto',
                },
              ]}>
              It’s important to note here that an LSP DOES NOT HAVE ACCESS TO
              YOUR FUNDS. They are mearly a helper to make the Lightning
              Networks liquidity constraint have less of an impact.
            </Text>
            <TouchableOpacity
              onPress={() => {
                try {
                  WebBrowser.openBrowserAsync(
                    'https://thebitcoinmanual.com/articles/explained-lsp/#:~:text=LSPs%20are%20counterparties%20on%20users%E2%80%99%20payment%20channels%20that,network%20management%20such%20as%3A%20Opening%20and%20closing%20channels',
                  );
                } catch (err) {
                  console.log(err);
                }
              }}
              style={[BTN, {backgroundColor: COLORS.primary, marginTop: 0}]}>
              <Text
                style={{
                  fontSize: SIZES.large,
                  color: COLORS.lightModeBackground,
                }}>
                Learn More
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },
  innerContainer: {
    flex: 1,
    width: '95%',
  },
  text: {
    width: '90%',
    fontSize: SIZES.medium,
    marginBottom: 10,
    fontFamily: FONT.Descriptoin_Regular,
  },
});
