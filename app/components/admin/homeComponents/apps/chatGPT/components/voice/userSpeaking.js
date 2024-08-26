import React, {useEffect, useState} from 'react';
import {
  View,
  Button,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Image,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Voice from '@react-native-voice/voice';
import {useGlobalContextProvider} from '../../../../../../../../context-store/context';
import {COLORS, ICONS} from '../../../../../../../constants';
import {ThemeText} from '../../../../../../../functions/CustomElements';
import Icon from '../../../../../../../functions/CustomElements/Icon';
import {useNavigation} from '@react-navigation/native';

const UserSpeaking = () => {
  const windowDimensions = useWindowDimensions();
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isGettingResponse, setIsGettingResponse] = useState(false);
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);
  const scale = useSharedValue(1);
  const navigate = useNavigation();

  useEffect(() => {
    Voice.onSpeechVolumeChanged = event => {
      const volume = event.value;
      // Use the volume level to scale the circle
      scale.value = withSpring(1 + volume * 0.1); // Adjust the multiplier for more/less sensitivity
    };
    Voice.onSpeechResults = event => {
      console.log(event, 'ON SPEACH END');
    };

    startListening();
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    setIsUserSpeaking(true);

    try {
      await Voice.start('en-US');
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = async () => {
    setIsUserSpeaking(false);
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
    };
  });

  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity
          onPress={() => {
            setIsUserSpeaking(prev => {
              console.log(prev);
              if (!prev) {
                startListening();
                console.log('FALSE');
              } else {
                stopListening();
                console.log('TRUE');
              }

              return !prev;
            });
          }}>
          <Animated.View
            style={[
              {
                width: windowDimensions.width / 2,
                height: windowDimensions.width / 2,
                borderRadius: windowDimensions.width / 2,
                backgroundColor: COLORS.darkModeText,
              },
              animatedStyle,
            ]}
          />
        </TouchableOpacity>
        <ThemeText
          styles={{color: COLORS.darkModeText, marginTop: 90}}
          content={
            !isUserSpeaking && !isGettingResponse && !isPlayingResponse
              ? 'Start speaking'
              : isUserSpeaking
              ? 'Listening'
              : isGettingResponse
              ? 'Tap to cancel'
              : 'Tap to inturrupt'
          }
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '90%',
        }}>
        <View>
          <ThemeText
            styles={{color: COLORS.darkModeText}}
            content={isUserSpeaking ? 'Cancel' : 'Start'}
          />
        </View>
        <TouchableOpacity
          onPress={navigate.goBack}
          style={{backgroundColor: COLORS.darkModeText, borderRadius: 50}}>
          <Icon height={70} width={70} name={'cancelIcon'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});
export default UserSpeaking;
