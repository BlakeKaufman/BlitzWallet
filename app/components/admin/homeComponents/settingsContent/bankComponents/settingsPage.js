import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ICONS,
  MAX_CHANNEL_OPEN_FEE,
  MIN_CHANNEL_OPEN_FEE,
  SIZES,
} from '../../../../../constants';
import {CENTER} from '../../../../../constants/styles';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import {WINDOWWIDTH} from '../../../../../constants/theme';
import handleBackPress from '../../../../../hooks/handleBackPress';
import GetThemeColors from '../../../../../hooks/themeColors';
import ThemeImage from '../../../../../functions/CustomElements/themeImage';
import CustomToggleSwitch from '../../../../../functions/CustomElements/switch';
import {formatBalanceAmount} from '../../../../../functions';

const SETTINGSITEMS = [
  {
    desc: `By turning on auto channel rebalance, Blitz will automatically swap funds from your channel to the bank or the bank to your channels based on the percentage of outgoing capacity you initially want.`,
    name: 'Auto channel rebalance',
    id: 'acr', //auto channel rebalance
  },
  {
    desc: `By turning on regulated channel open, if you reach your inbound liquidity limit during a session, new funds will automatically be swapped to your bank for future use without opening a new channel. Once your bank has the amount specified above, a channel will be opened.`,
    name: 'Regulate channel open',
    id: 'rco', //regulate channel open
  },
];

export default function LiquidSettingsPage() {
  const navigate = useNavigation();
  const {masterInfoObject, toggleMasterInfoObject} = useGlobalContextProvider();
  const [inputText, setInputText] = useState(undefined);
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();

  const handleBackPressFunction = useCallback(() => {
    navigate.goBack();
    return true;
  }, [navigate]);

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, [handleBackPressFunction]);

  const settingsElements = SETTINGSITEMS.map((item, index) => {
    return (
      <SettingsItem
        settingsDescription={item.desc}
        settingsName={item.name}
        id={item.id}
      />
    );
  });

  return (
    <GlobalThemeView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{flex: 1, alignItems: 'center'}}>
        <View style={{flex: 1, width: WINDOWWIDTH}}>
          <View style={styles.topbar}>
            <TouchableOpacity
              style={{position: 'absolute'}}
              onPress={() => {
                navigate.goBack();
              }}>
              <ThemeImage
                lightsOutIcon={ICONS.arrow_small_left_white}
                lightModeIcon={ICONS.smallArrowLeft}
                darkModeIcon={ICONS.smallArrowLeft}
              />
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
                    backgroundColor: backgroundOffset,
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
                      masterInfoObject.liquidWalletSettings
                        .maxChannelOpenFee === 0 ||
                        masterInfoObject.liquidWalletSettings.maxChannelOpenFee
                        ? masterInfoObject.liquidWalletSettings
                            .maxChannelOpenFee
                        : 5000,
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

                      if (
                        inputText ==
                        masterInfoObject.liquidWalletSettings.maxChannelOpenFee
                      ) {
                        return;
                      }

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
                      backgroundColor: backgroundColor,
                      color: textColor,
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
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();
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
        backgroundColor: backgroundOffset,
        borderRadius: 8,
        marginTop: 20,
      }}>
      <View
        style={[
          styles.switchContainer,
          {
            borderBottomColor: backgroundColor,
          },
        ]}>
        <View style={styles.inlineItemContainer}>
          <ThemeText content={settingsName} />

          <CustomToggleSwitch
            page={'bankSettings'}
            containerStyles={{marginRight: 10}}
            toggleSwitchFunction={() => {
              setIsActive(prev => {
                setTimeout(() => {
                  toggleMasterInfoObject({
                    liquidWalletSettings: {
                      ...masterInfoObject.liquidWalletSettings,
                      [id === 'acr'
                        ? 'autoChannelRebalance'
                        : 'regulateChannelOpen']: !prev,
                    },
                  });
                }, 500);

                return !prev;
              });
            }}
            stateValue={isActive}
          />

          {/* <Switch
            style={{marginRight: 10}}
            onChange={event => {
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
          /> */}
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
                backgroundColor: backgroundColor,
                color: textColor,
              }}
            />
          </View>
        )}
        {id === 'rco' && isActive && (
          <View style={styles.inlineItemContainer}>
            <ThemeText content={'Channel open size (sats)'} />
            <TextInput
              value={inputText}
              defaultValue={String(
                masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize,
              )}
              onChangeText={setInputText}
              keyboardType="number-pad"
              onEndEditing={() => {
                console.log(
                  inputText,
                  MAX_CHANNEL_OPEN_FEE,
                  MIN_CHANNEL_OPEN_FEE,
                );
                if (!inputText) return;
                if (
                  masterInfoObject.liquidWalletSettings
                    .regulatedChannelOpenSize == inputText
                )
                  return;
                if (
                  inputText < MIN_CHANNEL_OPEN_FEE ||
                  inputText > MAX_CHANNEL_OPEN_FEE
                ) {
                  navigate.navigate('ErrorScreen', {
                    errorMessage: `${
                      inputText <= MAX_CHANNEL_OPEN_FEE
                        ? `Minimum channel open size cannot be smaller than ${formatBalanceAmount(
                            MIN_CHANNEL_OPEN_FEE,
                          )} sats`
                        : `Minimum channel open size cannot be larger than ${formatBalanceAmount(
                            MAX_CHANNEL_OPEN_FEE,
                          )} sats`
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
                backgroundColor: backgroundColor,
                color: textColor,
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
    ...CENTER,
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
