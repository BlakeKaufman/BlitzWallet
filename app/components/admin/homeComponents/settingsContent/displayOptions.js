import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import {getLocalStorageItem, setLocalStorageItem} from '../../../../functions';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';

export default function DisplayOptions() {
  const {theme, userTxPreferance, toggleUserTxPreferance} =
    useGlobalContextProvider();

  const homeScreenTxElements = createHomepageTxOptions(
    userTxPreferance,
    toggleUserTxPreferance,
    theme,
  );

  return (
    <View style={{flex: 1}}>
      <View style={{paddingTop: 25, alignItems: 'center'}}>
        <Text
          style={[
            styles.infoHeaders,
            {
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          Home Screen Transactions
        </Text>
        <View
          style={[
            styles.contentContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
              paddingVertical: 0,
              alignItems: 'center',
            },
          ]}>
          <View
            style={[
              styles.homeScreenTxOptionContainer,
              {
                borderBottomColor: theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText,
              },
            ]}>
            <Text
              style={[
                styles.homeScreenTxOption,
                {
                  fontFamily: FONT.Title_Bold,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Show recent:
            </Text>
          </View>
          {homeScreenTxElements}
        </View>
      </View>
    </View>
  );
}

function createHomepageTxOptions(activeNum, setActiveNum, theme) {
  const USEROPTIONS = [3, 5, 10, 15, 20, 25];
  if (!activeNum) return;

  return USEROPTIONS.map((num, id) => {
    return (
      <View
        key={id}
        style={[
          styles.homeScreenTxOptionContainer,
          {
            borderBottomWidth: id + 1 === USEROPTIONS.length ? 0 : 1,
            borderBottomColor: theme
              ? COLORS.darkModeText
              : COLORS.lightModeText,
          },
        ]}>
        <TouchableOpacity
          style={[
            styles.homeScreenTxOptionContainer,
            {borderBottomWidth: 0, padding: 0},
          ]}
          onPress={() => {
            setActiveNum(num);
            handleSwitch(num);
          }}>
          <Text
            style={[
              styles.homeScreenTxOption,
              {
                fontFamily: FONT.Title_Regular,
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            {num} payments
          </Text>
          {num === activeNum && (
            <Image style={{width: 15, height: 15}} source={ICONS.checkIcon} />
          )}
        </TouchableOpacity>
      </View>
    );
  });
}

function handleSwitch(num) {
  setLocalStorageItem('homepageTxPreferace', JSON.stringify(num));
}

const styles = StyleSheet.create({
  infoHeaders: {
    width: '95%',
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.medium,
    marginBottom: 5,
  },
  contentContainer: {
    width: '95%',
    padding: 8,
    borderRadius: 8,
  },
  homeScreenTxOptionContainer: {
    width: '100%',
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  homeScreenTxOption: {
    fontSize: SIZES.medium,
  },
});
