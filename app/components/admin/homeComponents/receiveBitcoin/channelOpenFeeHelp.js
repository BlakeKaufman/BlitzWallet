import {useNavigation} from '@react-navigation/native';
import {
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {COLORS, SIZES} from '../../../../constants';
import GetThemeColors from '../../../../hooks/themeColors';
import {ThemeText} from '../../../../functions/CustomElements';

export default function ChannelOpenFeeInformation() {
  const navigate = useNavigation();
  const {backgroundOffset} = GetThemeColors();

  return (
    <TouchableWithoutFeedback onPress={() => navigate.goBack()}>
      <View style={styles.container}>
        <View
          style={{
            ...styles.contentContainer,
            backgroundColor: backgroundOffset,
          }}>
          <ThemeText
            styles={{
              ...styles.headingText,
              fontWeight: 500,
              fontSize: SIZES.large,
            }}
            content={'Why is this fee different?'}
          />
          <ThemeText
            styles={styles.headingText}
            content={
              'Blitz Wallet uses multiple technologies to give you the best experience possible.'
            }
          />
          <ThemeText
            styles={styles.headingText}
            content={
              'You are currently receiving enough Bitcoin to use one of the technologies and to do so takes an initial fee.'
            }
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.halfModalBackgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    maxWidth: Dimensions.get('screen').width * 0.9,
    padding: 10,
    borderRadius: 8,
  },
  headingText: {textAlign: 'center', marginBottom: 10},
});
