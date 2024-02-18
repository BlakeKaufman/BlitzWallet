import {useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {
  Back_BTN,
  Image_header,
  Switch_Text,
  Continue_BTN,
} from '../../components/login';
import {Background, COLORS, ICONS} from '../../constants';

export default function DislaimerPage({navigation: {navigate}}) {
  const [isEnabled, setIsEnabled] = useState([
    {for: 'top', isEnabled: false},
    {for: 'bottom', isEnabled: false},
  ]);

  const toggleSwitch = clicked => {
    setIsEnabled(previousState =>
      previousState.map(state => {
        if (state.for === clicked)
          return {...state, isEnabled: !state.isEnabled};
        else return state;
      }),
    );
  };

  return (
    <View style={Background}>
      <SafeAreaView style={[styles.globalContainer]}>
        <Back_BTN navigation={navigate} destination="Home" />
        <View style={styles.contentContainer}>
          <Image_header
            text="Two things you must understand"
            image={ICONS.walletIcon}
          />
          <Switch_Text
            for="top"
            text="With Bitcoin, you are your own bank. No one else has access to your private keys."
            isEnabled={isEnabled}
            toggleSwitch={toggleSwitch}
          />

          <Switch_Text
            for="bottom"
            text="If you lose access to this app, and the backup we will help you create, your bitcoin cannot be recovered."
            isEnabled={isEnabled}
            toggleSwitch={toggleSwitch}
          />
          <Continue_BTN
            destination="StartKeyGeneration"
            continue={isEnabled}
            text="Next"
            for="disclaimer"
            navigation={navigate}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    paddingBottom: 15,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});
