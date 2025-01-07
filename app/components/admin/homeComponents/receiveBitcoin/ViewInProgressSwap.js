// import {
//   ActivityIndicator,
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   SafeAreaView,
//   ScrollView,
//   Image,
// } from 'react-native';
// import {
//   BTN,
//   CENTER,
//   COLORS,
//   FONT,
//   ICONS,
//   SATSPERBITCOIN,
//   SIZES,
// } from '../../../../constants';
// import {useGlobalContextProvider} from '../../../../../context-store/context';
// import * as Clipboard from 'expo-clipboard';
// import {useNavigation} from '@react-navigation/native';

// import {formatBalanceAmount} from '../../../../functions';

// export default function ViewInProgressSwap(props) {
//   const navigate = useNavigation();
//   const {theme, nodeInformation, masterInfoObject} = useGlobalContextProvider();
//   const inProgressSwapInfo = props.route.params.inProgressSwapInfo;
//   const typeOfSwap = props.route.params.type;

//   console.log(inProgressSwapInfo);

//   const inProgressSwapTxIds =
//     typeOfSwap === 'bitcoin'
//       ? inProgressSwapInfo.unconfirmedTxIds.map((id, key) => {
//           return (
//             <View
//               key={key}
//               style={{
//                 width: '100%',
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 marginBottom: 20,
//                 flexWrap: 'wrap',
//               }}>
//               <Text style={styles.confirmingSwapTXID}>Tx id:</Text>
//               <TouchableOpacity onPress={() => copyToClipboard(id)}>
//                 <Text
//                   style={{
//                     fontFamily: FONT.Descriptoin_Regular,
//                     fontSize: SIZES.medium,
//                     color: theme ? COLORS.darkModeText : COLORS.lightModeText,
//                   }}>
//                   {id}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           );
//         })
//       : ['Swap hash', 'Adjusted Swap Amount', 'Swap Id', 'Redeem Script'].map(
//           (value, id) => {
//             return (
//               <View
//                 key={id}
//                 style={{
//                   width: '100%',
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   marginBottom: 20,
//                   flexWrap: 'wrap',
//                 }}>
//                 <Text style={styles.confirmingSwapTXID}>{value}:</Text>
//                 <TouchableOpacity
//                   onPress={() =>
//                     copyToClipboard(
//                       inProgressSwapInfo[
//                         value === 'Swap hash'
//                           ? 'hash'
//                           : value === 'Adjusted Swap Amount'
//                           ? 'adjustedSatAmount'
//                           : value === 'Swap Id'
//                           ? 'id'
//                           : 'redeemScript'
//                       ],
//                     )
//                   }>
//                   <Text
//                     style={{
//                       fontFamily: FONT.Descriptoin_Regular,
//                       fontSize: SIZES.medium,
//                       color: theme ? COLORS.darkModeText : COLORS.lightModeText,
//                     }}>
//                     {value === 'Adjusted Swap Amount'
//                       ? masterInfoObject.userBalanceDenomination === 'sats'
//                         ? formatBalanceAmount(
//                             inProgressSwapInfo['adjustedSatAmount'],
//                           )
//                         : formatBalanceAmount(
//                             (
//                               (nodeInformation.fiatStats.value /
//                                 SATSPERBITCOIN) *
//                               inProgressSwapInfo['adjustedSatAmount']
//                             ).toFixed(2),
//                           )
//                       : inProgressSwapInfo[
//                           value === 'Swap hash'
//                             ? 'hash'
//                             : value === 'Adjusted Swap Amount'
//                             ? 'adjustedSatAmount'
//                             : value === 'Swap Id'
//                             ? 'id'
//                             : 'redeemScript'
//                         ]}
//                     {value === 'Adjusted Swap Amount'
//                       ? masterInfoObject.userBalanceDenomination === 'sats'
//                         ? ' sats'
//                         : ` ${nodeInformation.fiatStats.coin}`
//                       : ''}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             );
//           },
//         );
//   return (
//     <View
//       style={[
//         {
//           backgroundColor: theme
//             ? COLORS.darkModeBackground
//             : COLORS.lightModeBackground,
//           flex: 1,
//         },
//       ]}>
//       <SafeAreaView style={styles.confirmingSwapContainer}>
//         <TouchableOpacity
//           style={{marginRight: 'auto'}}
//           activeOpacity={0.6}
//           onPress={() => {
//             navigate.goBack();
//           }}>
//           <Image
//             source={ICONS.leftCheveronIcon}
//             style={{width: 30, height: 30}}
//             resizeMode="contain"
//           />
//         </TouchableOpacity>
//         {typeOfSwap === 'bitcoin' && (
//           <>
//             <Text
//               style={[
//                 styles.confirmingSwapHeader,
//                 {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
//               ]}>
//               Swap in progress
//             </Text>
//             <ActivityIndicator
//               size="large"
//               color={theme ? COLORS.darkModeText : COLORS.lightModeText}
//               style={{marginVertical: 50}}
//             />
//           </>
//         )}
//         <View
//           style={{
//             [typeOfSwap === 'bitcoin' ? 'height' : 'flex']:
//               typeOfSwap === 'bitcoin' ? 150 : 1,
//             width: '90%',
//             alignItems: 'center',
//             justifyContent: 'center',
//             ...CENTER,
//           }}>
//           {typeOfSwap === 'bitcoin' ? (
//             <ScrollView style={{flex: 1}}>{inProgressSwapTxIds}</ScrollView>
//           ) : (
//             inProgressSwapTxIds
//           )}
//         </View>

//         {typeOfSwap != 'liquid' && (
//           <>
//             <Text style={styles.swapErrorMessage}>
//               Swaps become refundable after 288 blocks or around 2 days. If your
//               swap has not come through before then, come back to this page and
//               click the button below.
//             </Text>

//             <TouchableOpacity
//               style={[BTN, {backgroundColor: COLORS.primary}]}
//               onPress={() => navigate.navigate('RefundBitcoinTransactionPage')}>
//               <Text
//                 style={{
//                   color: COLORS.darkModeText,
//                   fontFamily: FONT.Descriptoin_Regular,
//                 }}>
//                 Issue refund
//               </Text>
//             </TouchableOpacity>
//           </>
//         )}
//       </SafeAreaView>
//     </View>
//   );
//   async function copyToClipboard(address) {
//     try {
//       await Clipboard.setStringAsync(address);
//       navigate.navigate('ClipboardCopyPopup', {didCopy: true});
//       return;

//       // Alert.alert('Text Copied to Clipboard');
//     } catch (err) {
//       navigate.navigate('ClipboardCopyPopup', {didCopy: false});
//       // Alert.alert('ERROR WITH COPYING');
//     }
//   }
// }
// const styles = StyleSheet.create({
//   confirmingSwapContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   confirmingSwapHeader: {
//     fontFamily: FONT.Title_Bold,
//     fontSize: SIZES.large,
//     marginBottom: 20,
//   },
//   confirmingSwapTXID: {
//     fontFamily: FONT.Descriptoin_Regular,
//     fontSize: SIZES.medium,
//     color: COLORS.primary,
//     marginRight: 5,
//   },
//   swapErrorMessage: {
//     color: COLORS.cancelRed,
//     fontFamily: FONT.Descriptoin_Regular,
//     fontSize: SIZES.medium,
//     width: '90%',
//     textAlign: 'center',
//     marginTop: 20,
//   },
// });
