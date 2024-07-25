import {useNavigation} from '@react-navigation/native';
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {BTN, CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import HowToSteps from '../fundGift/howToSteps';
import {ThemeText} from '../../../../functions/CustomElements';
import CustomButton from '../../../../functions/CustomElements/button';

export default function FundWalletGift() {
  const navigate = useNavigation();
  const {theme} = useGlobalContextProvider();

  return (
    <>
      <View style={{flex: 1, alignItems: 'center', marginBottom: 5}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.contentItem]}>
            <ThemeText
              styles={{...styles.contentHeader}}
              content={'What is this?'}
            />
            <View
              style={[
                styles.contentDescriptionContainer,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                },
              ]}>
              <ThemeText
                styles={{...styles.contentDescription}}
                content={`Self-custodial lightning can be intimidating at first. What are channels? How do I restore my wallet if I get a new phone? How do I set up my account? All of these questions are valid and pain points for people.`}
              />
              <ThemeText
                styles={{...styles.contentDescription}}
                content={`Here at Blitz, we believe in easing the transition to self-custodial lighting. And because of our passion for that, we created the gift-a-wallet feature.`}
              />
              <ThemeText
                styles={{...styles.contentDescription}}
                content={`By using this feature, you can pre-fund someonbody's wallet so as soon as they open it for the first time, they can send and receive Bitcoin over the lightning network instantly.`}
              />
              <ThemeText
                styles={{...styles.contentDescription, marginBottom: 0}}
                content={`This feature is trust based and needs to be used with extreme care.`}
              />
            </View>
          </View>
          <View style={[styles.contentItem]}>
            <ThemeText
              content={'How to do this?'}
              styles={{...styles.contentHeader}}
            />
            <View
              style={[
                styles.contentDescriptionContainer,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                },
              ]}>
              <HowToSteps />
            </View>
          </View>
        </ScrollView>
      </View>
      <CustomButton
        buttonStyles={{width: '100%', marginTop: 10}}
        textStyles={{textTransform: 'uppercase'}}
        actionFunction={() => navigate.navigate('AmountToGift')}
        textContent={'Start process'}
      />
      {/* <TouchableOpacity
        onPress={() => {
          (async () => {
            try {
              // Alert.alert('Coming Soon....');
              navigate.navigate('AmountToGift');
            } catch (err) {
              Alert.alert(
                'Not connected to node',
                'Please connect to node to start this process',
              );
            }
          })();
        }}
        style={[
          BTN,
          {
            backgroundColor: COLORS.primary,
            marginTop: 'auto',
            marginBottom: 0,
            ...CENTER,
          },
        ]}>
        <ThemeText styles={{...styles.buttonText}} content={'Start process'} />
      </TouchableOpacity> */}
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  contentItem: {
    width: '100%',
    marginVertical: 10,
  },
  contentHeader: {
    fontFamily: FONT.Title_Bold,
    marginBottom: 10,
  },
  contentDescriptionContainer: {
    padding: 10,
    borderRadius: 8,
  },
  contentDescription: {
    marginBottom: 10,
  },

  buttonText: {
    color: COLORS.white,
  },
});
