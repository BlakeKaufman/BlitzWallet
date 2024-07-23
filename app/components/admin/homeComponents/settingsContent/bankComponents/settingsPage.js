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
import {
  ANDROIDSAFEAREA,
  CENTER,
  backArrow,
} from '../../../../../constants/styles';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import {WINDOWWIDTH} from '../../../../../constants/theme';
import handleBackPress from '../../../../../hooks/handleBackPress';

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
  const navigate = useNavigation();
  const {theme, masterInfoObject, toggleMasterInfoObject} =
    useGlobalContextProvider();
  const [inputText, setInputText] = useState(undefined);

  function handleBackPressFunction() {
    navigate.goBack();
    return true;
  }
  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  const settingsElements = useMemo(() =>
    SETTINGSITEMS.map((item, index) => {
      return (
        <SettingsItem
          settingsDescription={item.desc}
          settingsName={item.name}
          id={item.id}
        />
      );
    }),
  );

  return (
    <GlobalThemeView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{flex: 1, alignItems: 'center'}}>
        <View style={{flex: 1, width: WINDOWWIDTH}}>
          <View style={styles.topbar}>
            <TouchableOpacity
              onPress={() => {
                navigate.goBack();
              }}>
              <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
            </TouchableOpacity>
            <ThemeText styles={{...styles.topBarText}} content={'Settings'} />
          </View>

          <View style={styles.settingsContainer}>
            {/* <FlatList
              renderItem={({item}) => (
                <SettingsItem
                  settingsDescription={item.desc}
                  settingsName={item.name}
                  id={item.id}
                />
              )}
              showsVerticalScrollIndicator={false}
              data={SETTINGSITEMS}
            /> */}
            <ScrollView>
              {settingsElements}
              <View
                key={'maxChannelOpen'}
                style={[
                  styles.warningContainer,
                  {
                    backgroundColor: theme
                      ? COLORS.darkModeBackgroundOffset
                      : COLORS.lightModeBackgroundOffset,
                    borderRadius: 8,
                    marginTop: 20,
                    width: '100%',
                    paddingHorizontal: '2.5%',
                  },
                ]}>
                <View style={styles.inlineItemContainer}>
                  <ThemeText content={'Max channel open fee (sats)'} />
                  <TextInput
                    value={inputText}
                    defaultValue={String(
                      masterInfoObject.liquidWalletSettings.maxChannelOpenFee ||
                        5000,
                    )}
                    onChangeText={setInputText}
                    keyboardType="number-pad"
                    onEndEditing={() => {
                      if (!inputText) {
                        setInputText(
                          String(
                            masterInfoObject.liquidWalletSettings
                              .maxChannelOpenFee,
                          ),
                        );
                        return;
                      }
                      console.log(
                        masterInfoObject.liquidWalletSettings.maxChannelOpenFee,
                        inputText,
                      );

                      if (
                        inputText ==
                        masterInfoObject.liquidWalletSettings.maxChannelOpenFee
                      ) {
                        return;
                      }
                      if (inputText == 0) return;

                      toggleMasterInfoObject({
                        liquidWalletSettings: {
                          ...masterInfoObject.liquidWalletSettings,
                          maxChannelOpenFee: Number(inputText),
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
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    }}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </GlobalThemeView>
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
      key={id}
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
          <ThemeText content={settingsName} />

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
            <ThemeText content={'Initial percentage'} />
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
                if (!inputText) return;
                console.log(
                  masterInfoObject.liquidWalletSettings
                    .autoChannelRebalancePercantage,
                  inputText,
                );
                if (
                  !inputText ||
                  masterInfoObject.liquidWalletSettings
                    .autoChannelRebalancePercantage == inputText
                ) {
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
                  }

                  return;
                }
                if (
                  inputText ==
                  masterInfoObject.liquidWalletSettings
                    .autoChannelRebalancePercantage
                )
                  return;
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
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              }}
            />
          </View>
        )}
        {id === 'rco' && isActive && (
          <View style={styles.inlineItemContainer}>
            <ThemeText content={'Channel Open Size (Sats)'} />
            <TextInput
              value={inputText}
              defaultValue={String(
                masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize,
              )}
              onChangeText={setInputText}
              keyboardType="number-pad"
              onEndEditing={() => {
                if (!inputText) return;
                if (
                  !inputText ||
                  inputText < 1000000 ||
                  inputText > 10000000 ||
                  masterInfoObject.liquidWalletSettings
                    .regulatedChannelOpenSiz == inputText
                ) {
                  if (
                    !inputText ||
                    inputText < 1000000 ||
                    inputText > 10000000
                  ) {
                    navigate.navigate('ErrorScreen', {
                      errorMessage: `${
                        inputText <= 1000000
                          ? 'Minimum channel open size cannot be smaller than 1 000 000 sats'
                          : 'Minimum channel open size cannot be larger than 10 000 000 sats'
                      }`,
                    });
                    setInputText(
                      String(
                        masterInfoObject.liquidWalletSettings
                          .regulatedChannelOpenSize,
                      ),
                    );
                  }

                  return;
                }

                if (
                  inputText ==
                  masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize
                )
                  return;

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
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              }}
            />
          </View>
        )}
        <ThemeText
          styles={{...styles.warningText}}
          content={settingsDescription}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  topbar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  topBarText: {
    fontSize: SIZES.large,

    marginLeft: 'auto',

    fontFamily: FONT.Title_Bold,
  },

  settingsContainer: {
    flex: 1,
    width: '100%',
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

  warningContainer: {
    width: '95%',
    marginLeft: 'auto',
    paddingVertical: 10,
  },
  warningText: {
    width: '90%',
  },
});
