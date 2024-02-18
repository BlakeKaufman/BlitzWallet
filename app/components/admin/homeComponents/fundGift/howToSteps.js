import {View, Text, StyleSheet} from 'react-native';
import {FONT, SIZES} from '../../../../constants';

const STEPS = [
  'Have gift receiver open thier app',
  'Click on the receive gift uption under restore wallet',
  'Have gift giver scan QR code on the next page',
  'Enter the amount you want to gift',
  'Click send',
];

export default function HowToSteps() {
  const stepElements = STEPS.map((step, number) => {
    return (
      <View
        style={[
          styles.stepContainer,
          {marginBottom: number + 1 === STEPS.length ? 0 : 10},
        ]}
        key={number}>
        <Text style={styles.stepNumber}>{number + 1}.</Text>
        <Text style={styles.description}>{step}</Text>
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
