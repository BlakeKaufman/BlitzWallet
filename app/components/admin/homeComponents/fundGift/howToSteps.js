// import {View, Text, StyleSheet} from 'react-native';
// import {COLORS, FONT, SIZES} from '../../../../constants';
// import {useGlobalContextProvider} from '../../../../../context-store/context';
// import {ThemeText} from '../../../../functions/CustomElements';

// const STEPS = [
//   'Enter the amount you want to gift',
//   'Click Create gift',
//   'Have gift receiver either scan, paste, or select from images the code that is generated',
//   'Done!',
// ];

// export default function HowToSteps() {
//   const {theme} = useGlobalContextProvider();
//   const stepElements = STEPS.map((step, number) => {
//     return (
//       <View
//         style={[
//           styles.stepContainer,
//           {marginBottom: number + 1 === STEPS.length ? 0 : 10},
//         ]}
//         key={number}>
//         <ThemeText styles={{...styles.stepNumber}} content={`${number + 1}.`} />
//         <ThemeText content={step} />
//       </View>
//     );
//   });

//   return <View>{stepElements}</View>;
// }

// const styles = StyleSheet.create({
//   stepContainer: {
//     width: '100%',
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   stepNumber: {
//     marginRight: 10,
//   },
// });
