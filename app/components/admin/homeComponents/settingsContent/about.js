import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {CENTER, COLORS, FONT, SHADOWS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';

import * as WebBrowser from 'expo-web-browser';
import {ThemeText} from '../../../../functions/CustomElements';
import CustomButton from '../../../../functions/CustomElements/button';
import {formatBalanceAmount, numberConverter} from '../../../../functions';

export default function AboutPage() {
  const {theme, nodeInformation, masterInfoObject} = useGlobalContextProvider();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.innerContainer}>
      <ThemeText
        content={'Software'}
        styles={{...styles.sectionHeader, marginTop: 30}}
      />
      <View style={[styles.contentContainer, {}]}>
        <Text style={{textAlign: 'center'}}>
          <ThemeText
            content={`Blitz is a free and open source app under the `}
          />
          <ThemeText
            styles={{color: COLORS.primary}}
            content={`Apache License`}
          />
          <ThemeText content={`,`} />
          <ThemeText content={` Version 2.0`} />
        </Text>
      </View>
      <View>
        <ThemeText
          content={'Blitz Wallet'}
          styles={{...styles.sectionHeader}}
        />
        <View style={[styles.contentContainer, {}]}>
          <ThemeText
            content={`This is self-custodial Bitcoin lightning wallet. Blitz does not have access to your funds, if you lose your backup pharse it may result in lost of funds.`}
            styles={{
              ...styles.contentText,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
            <ThemeText content={`Blitz uses `} />
            <ThemeText
              styles={{color: COLORS.primary}}
              content={`Breez SDK, `}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
            <ThemeText
              styles={{color: COLORS.primary}}
              content={`Blockstream GDK, `}
            />
            <ThemeText content={`and `} />
            <ThemeText
              styles={{color: COLORS.primary}}
              content={`Boltz API.`}
            />
          </View>
        </View>
        <ThemeText
          content={'Good to know'}
          styles={{...styles.sectionHeader}}
        />
        <View style={[styles.contentContainer, {}]}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
            <Text style={{textAlign: 'center'}}>
              <ThemeText content={`Blitz uses `} />
              <ThemeText
                styles={{color: COLORS.primary}}
                content={`liquid atomic swaps `}
              />
              <ThemeText
                content={`in the beginning and will open a main-chain lightning channel for you after you reach a balance of `}
              />
              <ThemeText
                styles={{color: COLORS.primary}}
                content={`${formatBalanceAmount(
                  numberConverter(
                    1000000,
                    masterInfoObject.uesrBalanceDenomination,
                    nodeInformation,
                    masterInfoObject.uesrBalanceDenomination === 'fiat' ? 2 : 0,
                  ),
                )} ${
                  masterInfoObject.uesrBalanceDenomination === 'fiat'
                    ? nodeInformation.fiatStats.coin
                    : 'sats'
                } `}
              />
              <ThemeText
                content={`to help you have a good and consistent experience with the Lighting Network.`}
              />
            </Text>
          </View>
        </View>

        <View style={{...CENTER, alignItems: 'center'}}>
          <ThemeText styles={{fontSize: SIZES.large}} content={'Creator'} />
          <CustomButton
            buttonStyles={{...styles.customButtonContainer, marginBottom: 10}}
            textStyles={{...styles.buttonTextStyles}}
            textContent={'Blake Kaufman'}
            actionFunction={() => openBrower('blake')}
          />
          <ThemeText styles={{fontSize: SIZES.large}} content={'UX/UI'} />
          <CustomButton
            buttonStyles={{...styles.customButtonContainer}}
            textStyles={{...styles.buttonTextStyles}}
            textContent={'Oliver Koblizek'}
            actionFunction={() => openBrower('oliver')}
          />
        </View>
      </View>
    </ScrollView>
  );

  async function openBrower(person) {
    try {
      await WebBrowser.openBrowserAsync(
        `https://x.com/${person === 'blake' ? 'blakekaufman17' : 'Stromens'}`,
      );
    } catch (err) {
      console.log(err, 'OPENING LINK ERROR');
    }
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
  contentContainer: {
    borderRadius: 8,
    marginBottom: 20,
  },

  contentText: {
    marginBottom: 10,
    textAlign: 'center',
  },

  customButtonContainer: {width: 'auto', backgroundColor: COLORS.primary},
  buttonTextStyles: {
    paddingVertical: 2,
    color: COLORS.darkModeText,
    paddingHorizontal: 5,
  },
});
