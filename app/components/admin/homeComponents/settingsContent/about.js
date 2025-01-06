import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {
  CENTER,
  COLORS,
  FONT,
  MIN_CHANNEL_OPEN_FEE,
  SIZES,
} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';

import {ThemeText} from '../../../../functions/CustomElements';
import CustomButton from '../../../../functions/CustomElements/button';
import {formatBalanceAmount, numberConverter} from '../../../../functions';

import {useNavigation} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

export default function AboutPage() {
  const {theme, nodeInformation, masterInfoObject, darkModeType} =
    useGlobalContextProvider();

  const navigate = useNavigation();
  const device_info = DeviceInfo.getVersion();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.innerContainer}>
      <ThemeText
        content={'Software'}
        styles={{...styles.sectionHeader, marginTop: 30}}
      />
      <Text style={styles.contentText}>
        <ThemeText content={`Blitz is a free and open source app under the `} />
        <ThemeText
          styles={{
            color: theme && darkModeType ? COLORS.darkModeText : COLORS.primary,
          }}
          content={`Apache License`}
        />
        <ThemeText content={`,`} />
        <ThemeText content={` Version 2.0`} />
      </Text>

      <ThemeText content={'Blitz Wallet'} styles={{...styles.sectionHeader}} />

      <ThemeText
        content={`This is a self-custodial Bitcoin wallet. Blitz does not have access to your funds, if you lose your backup phrase it may result in a loss of funds.`}
        styles={{
          ...styles.contentText,
        }}
      />
      <Text style={{textAlign: 'center'}}>
        <ThemeText content={`Blitz uses `} />
        <ThemeText
          styles={{
            color: theme && darkModeType ? COLORS.darkModeText : COLORS.primary,
          }}
          content={`Breez SDK, `}
        />
      </Text>
      <Text style={styles.contentText}>
        <ThemeText
          styles={{
            color: theme && darkModeType ? COLORS.darkModeText : COLORS.primary,
          }}
          content={`Blockstream GDK, `}
        />
        <ThemeText content={`and `} />
        <ThemeText
          styles={{
            color: theme && darkModeType ? COLORS.darkModeText : COLORS.primary,
          }}
          content={`Boltz API.`}
        />
      </Text>

      <ThemeText content={'Good to know'} styles={{...styles.sectionHeader}} />

      <Text
        style={{
          ...styles.contentText,
        }}>
        <ThemeText content={`Blitz uses `} />
        <ThemeText
          styles={{
            color: theme && darkModeType ? COLORS.darkModeText : COLORS.primary,
          }}
          content={`liquid atomic swaps `}
        />
        <ThemeText
          content={`in the beginning and will open a on-chain lightning channel for you after you reach a balance of `}
        />

        <ThemeText
          styles={{
            color: theme && darkModeType ? COLORS.darkModeText : COLORS.primary,
          }}
          content={`${formatBalanceAmount(
            numberConverter(
              MIN_CHANNEL_OPEN_FEE,
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
              masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
            ),
          )} ${
            masterInfoObject.userBalanceDenomination === 'fiat'
              ? nodeInformation.fiatStats.coin
              : 'sats'
          } `}
        />
        <ThemeText
          content={`to help you have a good and consistent experience with the Lightning Network.`}
        />
      </Text>

      <View style={{...CENTER, alignItems: 'center'}}>
        <ThemeText styles={{fontSize: SIZES.large}} content={'Creator'} />
        <CustomButton
          buttonStyles={{
            ...styles.customButtonContainer,
            marginBottom: 10,
            backgroundColor:
              theme && darkModeType ? COLORS.darkModeText : COLORS.primary,
          }}
          textStyles={{
            ...styles.buttonTextStyles,
            color:
              theme && darkModeType
                ? COLORS.lightModeText
                : COLORS.darkModeText,
          }}
          textContent={'Blake Kaufman'}
          actionFunction={() => openBrower('blake')}
        />
        <ThemeText styles={{fontSize: SIZES.large}} content={'UX/UI'} />
        <CustomButton
          buttonStyles={{
            ...styles.customButtonContainer,
            backgroundColor:
              theme && darkModeType ? COLORS.darkModeText : COLORS.primary,
          }}
          textStyles={{
            ...styles.buttonTextStyles,
            color:
              theme && darkModeType
                ? COLORS.lightModeText
                : COLORS.darkModeText,
          }}
          textContent={'Oliver Koblizek'}
          actionFunction={() => openBrower('oliver')}
        />
      </View>
      <ThemeText
        styles={{...CENTER, marginTop: 20}}
        content={`Version: ${device_info}`}
      />
    </ScrollView>
  );

  async function openBrower(person) {
    navigate.navigate('CustomWebView', {
      webViewURL: `https://x.com/${
        person === 'blake' ? 'blakekaufman17' : 'Stromens'
      }`,
    });
  }
}

const styles = StyleSheet.create({
  innerContainer: {
    width: '85%',
    ...CENTER,
  },

  sectionHeader: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
    textAlign: 'center',
    marginBottom: 10,
  },

  contentText: {
    textAlign: 'center',
    marginBottom: 20,
    textAlignVertical: 'center',
  },

  customButtonContainer: {width: 'auto', backgroundColor: COLORS.primary},
  buttonTextStyles: {
    paddingVertical: 5,
    color: COLORS.darkModeText,
    paddingHorizontal: 10,
  },
});
