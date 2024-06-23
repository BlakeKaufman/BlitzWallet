import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {COLORS, FONT, SHADOWS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';

import * as WebBrowser from 'expo-web-browser';
import {ThemeText} from '../../../../functions/CustomElements';

export default function AboutPage() {
  const {theme} = useGlobalContextProvider();

  return (
    <View style={[styles.container]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.innerContainer}>
        <ThemeText
          content={'Software'}
          styles={{...styles.sectionHeader, marginTop: 30}}
        />
        <View
          style={[
            styles.contentContainer,
            {
              marginBottom: 30,
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
            },
          ]}>
          <ThemeText
            content={`Blitz is a free and open source app under the Apache License, Version 2.0.`}
            styles={{
              ...styles.contentText,
              marginBottom: 0,
              textAlign: 'center',
            }}
          />
        </View>
        <View>
          <ThemeText
            content={'Blitz Wallet'}
            styles={{...styles.sectionHeader}}
          />
          <View
            style={[
              styles.contentContainer,
              {
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
              },
            ]}>
            <ThemeText
              content={`This is a SELF-CUSTODIAL Bitcoin Lightning wallet. Blitz does not have access to your seed phrase. If you lose or share your seed phrase, access to your funds may be lost.`}
              styles={{
                ...styles.contentText,
              }}
            />
            <ThemeText
              content={`Blitz uses the Breez SDK, Blockstream GDK, and Boltz to send and receive payments on the Bitcoin Lightning Network. The Lightning Network is still a developing protocol so loss of funds can occur.`}
              styles={{
                ...styles.contentText,
              }}
            />
            <ThemeText
              content={`DO NOT GIVE OUT YOUR 12 WORD SEED PHRASE!`}
              styles={{
                ...styles.contentText,
                color: COLORS.cancelRed,
                textAlign: 'center',
              }}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              (async () => {
                try {
                  await WebBrowser.openBrowserAsync(
                    'https://twitter.com/Stromens',
                  );
                } catch (err) {
                  console.log(err, 'OPENING LINK ERROR');
                }
              })();
            }}>
            <Text style={styles.designCredits}>
              Designed by: Oliver Koblizek
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  innerContainer: {
    width: '90%',
    paddingVertical: 20,
  },

  sectionHeader: {
    fontFamily: FONT.Title_Bold,
    marginLeft: 10,
    marginBottom: 10,
  },
  contentContainer: {
    backgroundColor: COLORS.offsetBackground,

    padding: 8,
    borderRadius: 8,
    ...SHADOWS.small,
  },
  contentText: {
    marginBottom: 20,
  },
  designCredits: {
    fontSize: SIZES.mediumm,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 5,
  },
});
