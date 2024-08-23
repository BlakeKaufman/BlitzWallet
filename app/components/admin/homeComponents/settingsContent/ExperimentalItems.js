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
          </View>
        </View>
        <View style={styles.warningContainer}>
          <ThemeText
            styles={{...styles.warningText}}
            content={
              'By turning on eCash you agree to the risk that your funds might be lost. Unlike Bitcoin which is self-custodial and Liquid which is a federated model, eCash is custodial and therefore your funds can be taken.'
            }
          />
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
    paddingRight: '5%',
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
