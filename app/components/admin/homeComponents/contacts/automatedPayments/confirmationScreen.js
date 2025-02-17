// import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
// import {COLORS, FONT, ICONS, SIZES} from '../../../../../constants';
// import {useGlobalContextProvider} from '../../../../../../context-store/context';
// import {formatBalanceAmount} from '../../../../../functions';
// import {useGlobalThemeContext} from '../../../../../../context-store/theme';
// import {useNodeContext} from '../../../../../../context-store/nodeContext';

// export default function AutomatedPaymentsConfirmationScreen(props) {
//   const {masterInfoObject} = useGlobalContextProvider();
//   const {nodeInformation, liquidNodeInformation} = useNodeContext();
//   const {theme, darkModeType} = useGlobalThemeContext();
//   return (
//     <View style={styles.completedContainer}>
//       <Image
//         style={styles.confirmIcon}
//         source={theme ? ICONS.CheckcircleLight : ICONS.CheckcircleDark}
//       />
//       <Text style={styles.completedText}>Completed</Text>
//       <View style={{alignItems: 'center', flex: 1}}>
//         <Text
//           style={[
//             styles.youRecievedHeader,
//             {
//               color: theme ? COLORS.darkModeText : COLORS.lightModeText,
//             },
//           ]}>
//           You {props.isGiveaway ? 'sent' : 'requested'} a total of
//         </Text>
//         <Text
//           style={[
//             styles.recivedAmount,
//             {
//               marginBottom: 'auto',
//               color: theme ? COLORS.darkModeText : COLORS.lightModeText,
//             },
//           ]}>
//           {formatBalanceAmount(
//             props.convertedBalanceAmount * props.addedContacts.length,
//           )}{' '}
//           {masterInfoObject.userBalanceDenomination != 'fiat'
//             ? 'sats'
//             : nodeInformation.fiatStats.coin}
//         </Text>
//         <TouchableOpacity
//           onPress={props.clearPage}
//           style={[styles.button, {backgroundColor: COLORS.primary}]}>
//           <Text style={styles.buttonText}>Create another</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   completedContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   confirmIcon: {
//     width: 150,
//     height: 150,
//     marginBottom: 10,
//     marginTop: 50,
//   },
//   completedText: {
//     fontFamily: FONT.Title_Regular,
//     fontSize: SIZES.xLarge,
//     marginBottom: 'auto',
//   },
//   youRecievedHeader: {
//     fontFamily: FONT.Title_Regular,
//     fontSize: SIZES.large,
//     marginTop: 'auto',
//     marginBottom: 10,
//   },
//   button: {
//     width: 150,
//     height: 35,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     borderRadius: 8,
//     marginTop: 50,
//   },
//   buttonText: {color: COLORS.white, fontFamily: FONT.Other_Regular},
// });
