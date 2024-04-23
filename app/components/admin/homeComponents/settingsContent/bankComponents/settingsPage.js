import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
import {CENTER, backArrow} from '../../../../../constants/styles';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {useRef, useState} from 'react';

const SETTINGSITEMS = [
  {
    desc: `By turning on auto channel rebalance, Blitz will automatically swap funds from your channel to the bank or the bank to your channels based on the percentage of outgoing capacity you initialy want.`,
    name: 'Auto channel rebalance',
    id: 'acr', //auto channel rebalance
  },
  {
    desc: `By turning on regulated channel open, if you reach your inbound liquidity limit during a session new funds will automatically be swapped to your bank for future use without opening a new channel. Once your bank has the amount specified above, a channel will be opened.`,
    name: 'Regulate channel open',
    id: 'rco', //regulate channel open
  },
];

export default function LiquidSettingsPage() {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme
          ? COLORS.darkModeBackground
          : COLORS.lightModeBackground,
      }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{flex: 1}}>
        <SafeAreaView style={{flex: 1, marginVertical: 5}}>
          <View style={styles.topbar}>
            <TouchableOpacity
              onPress={() => {
                navigate.goBack();
              }}>
              <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
            </TouchableOpacity>
            <Text
              style={[
                styles.topBarText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Settings
            </Text>
          </View>

          <View style={styles.settingsContainer}>
            <FlatList
              renderItem={({item}) => (
                <SettingsItem
                  settingsDescription={item.desc}
                  settingsName={item.name}
                  id={item.id}
                />
              )}
              showsVerticalScrollIndicator={false}
              data={SETTINGSITEMS}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

function SettingsItem({settingsName, settingsDescription, id}) {
  const {theme, masterInfoObject, toggleMasterInfoObject} =
    useGlobalContextProvider();

  const navigate = useNavigation();

  const [inputText, setInputText] = useState(undefined);

  const inputRef = useRef(null);

  const [isActive, setIsActive] = useState(
    id === 'acr'
      ? masterInfoObject.liquidWalletSettings.autoChannelRebalance
      : id === 'rco'
      ? masterInfoObject.liquidWalletSettings.regulateChannelOpen
      : false,
  );

  return (
    <View
      style={{
        backgroundColor: theme
          ? COLORS.darkModeBackgroundOffset
          : COLORS.lightModeBackgroundOffset,
        borderRadius: 8,
        marginTop: 20,
      }}>
      <View
        style={[
          styles.switchContainer,
          {
            borderBottomColor: theme
              ? COLORS.darkModeBackground
              : COLORS.lightModeBackground,
          },
        ]}>
        <View style={styles.inlineItemContainer}>
          <Text
            style={[
              styles.switchText,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            {settingsName}
          </Text>
          <Switch
            style={{marginRight: 10}}
            onChange={async event => {
              setIsActive(prev => {
                toggleMasterInfoObject({
                  liquidWalletSettings: {
                    ...masterInfoObject.liquidWalletSettings,
                    [id === 'acr'
                      ? 'autoChannelRebalance'
                      : 'regulateChannelOpen']: !prev,
                  },
                });
                return !prev;
              });
            }}
            value={isActive}
            trackColor={{false: '#767577', true: COLORS.primary}}
          />
        </View>
      </View>
      <View style={styles.warningContainer}>
        {id === 'acr' && isActive && (
          <View style={styles.inlineItemContainer}>
            <Text
              style={[
                styles.switchText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Initial percentage
            </Text>
            <TextInput
              ref={inputRef}
              value={inputText}
              defaultValue={String(
                masterInfoObject.liquidWalletSettings
                  .autoChannelRebalancePercantage,
              )}
              onChangeText={setInputText}
              keyboardType="number-pad"
              onEndEditing={() => {
                if (!inputText) {
                  navigate.navigate('ErrorScreen', {
                    errorMessage: 'Percentage cannot be 0',
                  });
                  setInputText(
                    String(
                      masterInfoObject.liquidWalletSettings
                        .autoChannelRebalancePercantage,
                    ),
                  );

                  return;
                }
                toggleMasterInfoObject({
                  liquidWalletSettings: {
                    ...masterInfoObject.liquidWalletSettings,
                    autoChannelRebalancePercantage: Number(inputText),
                  },
                });
              }}
              style={{
                padding: 10,
                borderRadius: 8,
                marginRight: 10,
                backgroundColor: theme
                  ? COLORS.darkModeBackground
                  : COLORS.lightModeBackground,
              }}
            />
          </View>
        )}
        {id === 'rco' && isActive && (
          <View style={styles.inlineItemContainer}>
            <Text
              style={[
                styles.switchText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Channel Open Size (Sats)
            </Text>
            <TextInput
              value={inputText}
              defaultValue={String(
                masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize,
              )}
              onChangeText={setInputText}
              keyboardType="number-pad"
              onEndEditing={() => {
                console.log(inputText);
                if (!inputText || inputText < 100000 || inputText > 10000000) {
                  navigate.navigate('ErrorScreen', {
                    errorMessage: `${
                      inputText <= 100000
                        ? 'Minimum channel open size cannot be smaller than 100 000 sats'
                        : 'Minimum channel open size cannot be larger than 10 000 000 sats'
                    }`,
                  });
                  setInputText(
                    String(
                      masterInfoObject.liquidWalletSettings
                        .regulatedChannelOpenSize,
                    ),
                  );

                  return;
                }

                toggleMasterInfoObject({
                  liquidWalletSettings: {
                    ...masterInfoObject.liquidWalletSettings,
                    regulatedChannelOpenSize: Number(inputText),
                  },
                });
              }}
              style={{
                padding: 10,
                borderRadius: 8,
                marginRight: 10,
                backgroundColor: theme
                  ? COLORS.darkModeBackground
                  : COLORS.lightModeBackground,
              }}
            />
          </View>
        )}
        <Text
          style={[
            styles.warningText,
            {
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          {settingsDescription}
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  topBarText: {
    fontSize: SIZES.large,
    marginRight: 'auto',
    marginLeft: 'auto',
    transform: [{translateX: -15}],
    fontFamily: FONT.Title_Bold,
  },

  settingsContainer: {
    flex: 1,
    width: '95%',
    ...CENTER,
  },

  switchContainer: {
    flexDirection: 'row',
    width: '95%',
    marginLeft: 'auto',
    borderBottomWidth: 1,
  },
  inlineItemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchText: {fontSize: SIZES.medium, fontFamily: FONT.Title_Regular},

  warningContainer: {
    width: '95%',
    marginLeft: 'auto',
    paddingVertical: 10,
  },
  warningText: {
    width: '90%',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },

  recoveryText: {
    width: '95%',
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    textAlign: 'center',
    marginVertical: 10,
    ...CENTER,
  },
});
