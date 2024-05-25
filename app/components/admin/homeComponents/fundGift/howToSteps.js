import {View, Text, StyleSheet} from 'react-native';
import {COLORS, FONT, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';

const STEPS = [
  'Enter the amount you want to gift',
  'Click Create gift',
  'Have gift receiver either scan, paste, or select from images the code that is generated',
  'Done!',
];

export default function HowToSteps() {
  const {theme} = useGlobalContextProvider();
  const stepElements = STEPS.map((step, number) => {
    return (
      <View
        style={[
          styles.stepContainer,
          {marginBottom: number + 1 === STEPS.length ? 0 : 10},
        ]}
        key={number}>
        <Text
          style={[
            styles.stepNumber,
            {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
          ]}>
          {number + 1}.
        </Text>
        <Text
          style={[
            styles.description,
            {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
          ]}>
          {step}
        </Text>
      </View>
    );
  });

  return <View>{stepElements}</View>;
}

const styles = StyleSheet.create({
  stepContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: '8%',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },
  description: {
    fontFamily: FONT.Descriptoin_Regular,
    width: '92%',
    flexWrap: 'wrap',
  },
});
