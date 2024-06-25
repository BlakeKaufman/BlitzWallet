import {
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import {ThemeText} from '../../../../functions/CustomElements';

export default function DisplayOptions() {
  const navigate = useNavigation();
  const {theme, toggleMasterInfoObject, masterInfoObject} =
    useGlobalContextProvider();

  const homeScreenTxElements = createHomepageTxOptions(
    masterInfoObject.homepageTxPreferance,
    toggleMasterInfoObject,
    theme,
  );

  return (
    <View style={{flex: 1}}>
      <View style={{paddingTop: 25, alignItems: 'center'}}>
        <ThemeText
          styles={{...styles.infoHeaders}}
          content={'Balance Denomination'}
        />
        <View
          style={[
            styles.contentContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
              flexDirection: 'row',
              paddingVertical: 10,
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            },
          ]}>
          <ThemeText content={'Current denomination'} />
          <TouchableOpacity
            onPress={() => {
              navigate.navigate('UserBalanceDenomination');
            }}
            style={{
              padding: 10,
              backgroundColor: theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
              borderRadius: 8,
            }}>
            <ThemeText
              styles={{textTransform: 'capitalize'}}
              content={masterInfoObject.userBalanceDenomination}
              reversed={true}
            />
          </TouchableOpacity>
        </View>
        {/*  */}
        <ThemeText
          styles={{...styles.infoHeaders}}
          content={'Home Screen Transactions'}
        />
        <View
          style={[
            styles.contentContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
              paddingVertical: 0,
              alignItems: 'center',
              marginBottom: 20,
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
            <ThemeText
              styles={{
                ...styles.homeScreenTxOption,
                fontFamily: FONT.Title_Bold,
              }}
              content={'Show recent:'}
            />
          </View>
          {homeScreenTxElements}
        </View>
        {/*  */}
        <View
          style={[
            styles.contentContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
              flexDirection: 'row',
              paddingVertical: 10,
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            },
          ]}>
          <ThemeText
            content={`${
              !masterInfoObject.enabledSlidingCamera ? 'Enable' : 'Disable'
            } camera slider`}
          />
          <Switch
            trackColor={{
              true: COLORS.primary,
            }}
            onChange={e => {
              toggleMasterInfoObject({
                enabledSlidingCamera: e.nativeEvent.value,
              });
            }}
            value={masterInfoObject.enabledSlidingCamera}
          />

          {/* <TouchableOpacity
            onPress={() => {
              navigate.navigate('UserBalanceDenomination');
            }}
            style={{
              padding: 10,
              backgroundColor: theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
              borderRadius: 8,
            }}>
            <ThemeText
              styles={{textTransform: 'capitalize'}}
              content={masterInfoObject.userBalanceDenomination}
              reversed={true}
            />
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
}

function createHomepageTxOptions(activeNum, setActiveNum, theme) {
  const USEROPTIONS = [15, 20, 25, 30, 35, 40];
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
            setActiveNum({homepageTxPreferance: num});
            // handleSwitch(num);
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

// function handleSwitch(num) {
//   setLocalStorageItem('homepageTxPreferace', JSON.stringify(num));
// }

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
