import {StyleSheet, Switch, View} from 'react-native';
import {ThemeText} from '../../../../functions/CustomElements';
import {CENTER, COLORS, FONT, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import CustomToggleSwitch from '../../../../functions/CustomElements/switch';

export default function ExperimentalItemsPage() {
  const {theme, toggleMasterInfoObject} = useGlobalContextProvider();
  return (
    <View style={{flex: 1, width: '90%', ...CENTER}}>
      <ThemeText
        styles={{marginTop: 20, fontSize: SIZES.large}}
        content={'eCash'}
      />
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
            <ThemeText content={`Use eCash`} />
            <CustomToggleSwitch page={'eCash'} />

            {/* <Switch
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
            /> */}
          </View>
        </View>
        <View style={styles.warningContainer}>
          <ThemeText styles={{...styles.warningText}} content={'testing'} />
        </View>
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
