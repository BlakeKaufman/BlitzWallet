// import {useRef, useEffect, useState, useMemo, useCallback} from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   Image,
//   TextInput,
//   KeyboardAvoidingView,
//   TouchableWithoutFeedback,
//   Keyboard,
//   ScrollView,
//   Platform,
// } from 'react-native';
// import {
//   COLORS,
//   FONT,
//   ICONS,
//   SATSPERBITCOIN,
//   SHADOWS,
//   SIZES,
// } from '../../../../../constants';
// import {backArrow, CENTER, headerText} from '../../../../../constants/styles';

// import {useGlobalContextProvider} from '../../../../../../context-store/context';
// import {useIsFocused, useNavigation} from '@react-navigation/native';
// import {useSafeAreaInsets} from 'react-native-safe-area-context';
// import {useDrawerStatus} from '@react-navigation/drawer';
// import {getPublicKey} from 'nostr-tools';

// import {formatBalanceAmount, numberConverter} from '../../../../../functions';
// import {pubishMessageToAbly} from '../../../../../functions/messaging/publishMessage';
// import {randomUUID} from 'expo-crypto';
// import {sendLiquidTransaction} from '../../../../../functions/liquidWallet';
// import AutomatedPaymentsConfirmationScreen from './confirmationScreen';
// import AutomatedPaymentsErrorScreen from './automatedPaymentsErrorScreen';
// import {
//   GlobalThemeView,
//   ThemeText,
// } from '../../../../../functions/CustomElements';

// import handleBackPress from '../../../../../hooks/handleBackPress';
// import CustomNumberKeyboard from '../../../../../functions/CustomElements/customNumberKeyboard';
// import FormattedSatText from '../../../../../functions/CustomElements/satTextDisplay';
// import {useGlobalContacts} from '../../../../../../context-store/globalContacts';
// import GetThemeColors from '../../../../../hooks/themeColors';
// import CustomButton from '../../../../../functions/CustomElements/button';

// export default function AutomatedPayments({navigation, route}) {
//   const {
//     theme,
//     nodeInformation,
//     masterInfoObject,
//     contactsPrivateKey,
//     liquidNodeInformation,
//     contactsImages,
//   } = useGlobalContextProvider();
//   const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();
//   const {
//     decodedAddedContacts,
//     globalContactsInformation,
//     toggleGlobalContactsInformation,
//   } = useGlobalContacts();
//   const publicKey = getPublicKey(contactsPrivateKey);
//   const isFocused = useIsFocused();
//   const navigate = useNavigation();
//   const contactsFocus = useRef(null);
//   const amountFocus = useRef(null);
//   const [isAmountFocused, setIsAmountFocused] = useState(false);
//   const descriptionFocus = useRef(null);
//   const isDrawerOpen = useDrawerStatus() === 'open';

//   const tabsNavigate = navigation.navigate;

//   const isGiveaway =
//     route.params.pageType.toLowerCase() === 'giveaway' && isFocused;

//   const [descriptionInput, setDescriptionInput] = useState('');
//   const [amountPerPerson, setAmountPerPerson] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');

//   const [addedContacts, setAddedContacts] = useState([]);
//   const [inputedContact, setInputedContact] = useState('');

//   const [isInputFocused, setIsInputFocused] = useState({
//     description: false,
//     amount: false,
//   });

//   const [numberOfGiftsSent, setNumberOfGiftsSent] = useState(0);
//   const [isSendingGifts, setIsSendingGifts] = useState(false);

//   const handleBackPressFunction = useCallback(() => {
//     tabsNavigate('Contacts Page');
//     return true;
//   }, [tabsNavigate]);

//   useEffect(() => {
//     handleBackPress(handleBackPressFunction);
//   }, [handleBackPressFunction]);

//   const convertedBalanceAmount =
//     masterInfoObject.userBalanceDenomination != 'fiat'
//       ? Math.round(amountPerPerson)
//       : Math.round(
//           (SATSPERBITCOIN / nodeInformation.fiatStats.value) * amountPerPerson,
//         );
//   const canCreateFaucet =
//     (!!amountPerPerson || !!descriptionInput) && convertedBalanceAmount >= 1500;
//   const hasContacts = decodedAddedContacts.length != 0;

//   const canSendGiveaway =
//     !isGiveaway ||
//     nodeInformation.userBalace >
//       amountPerPerson * addedContacts.length + addedContacts.length * 300 ||
//     liquidNodeInformation.userBalance >
//       amountPerPerson * addedContacts.length + addedContacts.length * 300;

//   useEffect(() => {
//     if (!isFocused && !isSendingGifts) {
//       clearPage();
//     }
//     if (!isDrawerOpen && !isSendingGifts) {
//       contactsFocus.current.focus();
//     }
//   }, [isDrawerOpen, isFocused, isSendingGifts]);

//   const addedContactsElements = useMemo(() => {
//     return (
//       addedContacts.length != 0 &&
//       addedContacts.map((contact, id) => {
//         return (
//           <View
//             style={{
//               padding: 5,
//               borderRadius: 8,
//               marginRight: 5,
//               backgroundColor: contact.isSelected
//                 ? COLORS.primary
//                 : 'transparent',
//             }}
//             key={id}>
//             <Text
//               style={{
//                 color: contact.isSelected
//                   ? COLORS.darkModeText
//                   : theme
//                   ? COLORS.darkModeText
//                   : COLORS.lightModeText,
//               }}>
//               {contact.name || contact.uniqueName}
//             </Text>
//           </View>
//         );
//       })
//     );
//   }, [addedContacts, theme]);

//   return (
//     <GlobalThemeView useStandardWidth={true}>
//       <TouchableWithoutFeedback
//         onPress={() => {
//           Keyboard.dismiss();
//           toggleInputFocus('amount', false);
//           setIsAmountFocused(false);
//         }}>
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : null}
//           style={{flex: 1}}>
//           {/* <SafeAreaView style={{flex: 1}}> */}
//           <View style={styles.topBar}>
//             <TouchableOpacity
//               onPress={() => {
//                 isGiveaway ? sendGiveaway() : sendPaymentRequests();
//               }}>
//               <ThemeText
//                 styles={{
//                   opacity:
//                     canSendGiveaway && canCreateFaucet && !isSendingGifts
//                       ? 1
//                       : 0.5,
//                 }}
//                 content={'Send'}
//               />
//             </TouchableOpacity>

//             <ThemeText content={isGiveaway ? 'Giveaway' : 'Payment request'} />
//             {/* <Text
//               style={[
//                 headerText,
//                 {
//                   transform: [{translateX: -10.5}],
//                   color: theme ? COLORS.darkModeText : COLORS.lightModeText,
//                 },
//               ]}>
//               {isGiveaway ? 'Giveaway' : 'Payment request'}
//             </Text> */}
//             <TouchableOpacity
//               onPress={() => {
//                 Keyboard.dismiss();
//                 navigation.openDrawer();
//               }}>
//               <Image style={[backArrow]} source={ICONS.drawerList} />
//             </TouchableOpacity>
//           </View>
//           {isSendingGifts ? (
//             numberOfGiftsSent === addedContacts.length ? (
//               <AutomatedPaymentsConfirmationScreen
//                 convertedBalanceAmount={convertedBalanceAmount}
//                 addedContacts={addedContacts}
//                 clearPage={clearPage}
//                 isGiveaway={isGiveaway}
//               />
//             ) : (
//               <AutomatedPaymentsErrorScreen
//                 clearPage={clearPage}
//                 numberOfGiftsSent={numberOfGiftsSent}
//                 addedContacts={addedContacts}
//                 errorMessage={errorMessage}
//                 isGiveaway={isGiveaway}
//               />
//             )
//           ) : (
//             <>
//               <TouchableOpacity
//                 onPress={() => {
//                   handleInput(null, true);
//                   contactsFocus.current.focus();
//                 }}>
//                 <View
//                   style={{
//                     width: '100%',
//                     flexDirection: 'row',
//                     alignItems: 'center', // may screw up android styling... not sure yet
//                     flexWrap: 'wrap',
//                     marginTop: 10,
//                     paddingVertical: 5,

//                     borderBottomColor: backgroundOffset,
//                     borderBottomWidth: 1,
//                   }}>
//                   <Text
//                     style={{
//                       color: theme ? COLORS.darkModeText : COLORS.lightModeText,
//                       marginRight: 10,
//                       fontSize: SIZES.medium,
//                     }}>
//                     Sending to:
//                   </Text>
//                   {addedContactsElements || ''}
//                   <TextInput
//                     onFocus={() => {
//                       setIsAmountFocused(false);
//                       toggleInputFocus('amount', false);
//                     }}
//                     onChangeText={setInputedContact}
//                     autoFocus={true}
//                     keyboardType="default"
//                     ref={contactsFocus}
//                     onKeyPress={event => {
//                       handleInput(event);
//                     }}
//                     // onFocus={handleInput(null, true)}

//                     value={inputedContact}
//                     cursorColor={textColor}
//                     blurOnSubmit={false}
//                     style={{
//                       color: textColor,
//                       fontSize: SIZES.medium,
//                     }}
//                     onSubmitEditing={() => {
//                       if (inputedContact) {
//                         // navigate
//                         navigate.navigate('ErrorScreen', {
//                           errorMessage: 'Not a valid contact',
//                         });
//                         return;
//                       }
//                       // contactsFocus.current.blur();
//                       descriptionFocus.current.focus();

//                       console.log('SUBMIT');
//                     }}
//                   />
//                 </View>
//               </TouchableOpacity>

//               {inputedContact ? (
//                 <View style={styles.contactsListContainer}>
//                   <Text
//                     style={[
//                       styles.contactsListHeader,
//                       {
//                         color: textColor,
//                       },
//                     ]}>
//                     From your contacts
//                   </Text>
//                   <ScrollView contentContainerStyle={{flex: 1}}>
//                     {hasContacts ? (
//                       <SerchFilteredContactsList
//                         contacts={decodedAddedContacts}
//                         filterTerm={inputedContact}
//                         addedContacts={addedContacts}
//                         setAddedContacts={setAddedContacts}
//                         setInputedContact={setInputedContact}
//                         navigation={navigation}
//                         contactsImages={contactsImages}
//                       />
//                     ) : (
//                       <NoContactsFoundPage navigation={navigation} />
//                     )}
//                   </ScrollView>
//                 </View>
//               ) : (
//                 <View
//                   style={[
//                     styles.givawayInfoContainer,

//                     // {paddingBottom: keyboardHeight},
//                   ]}>
//                   <TouchableOpacity
//                     onPress={() => {
//                       descriptionFocus.current.focus();
//                     }}
//                     style={[styles.inputContainer, {marginBottom: 20}]}>
//                     <View
//                       style={[
//                         styles.labelContainer,
//                         {
//                           backgroundColor: backgroundOffset,
//                         },
//                       ]}>
//                       <Image style={styles.labelIcon} source={ICONS.bankIcon} />
//                     </View>
//                     <TextInput
//                       placeholder="Enter a description"
//                       placeholderTextColor={
//                         theme ? COLORS.darkModeText : COLORS.lightModeText
//                       }
//                       blurOnSubmit={false}
//                       ref={descriptionFocus}
//                       onChangeText={setDescriptionInput}
//                       onFocus={() => {
//                         toggleInputFocus('amount', false);

//                         setIsAmountFocused(false);

//                         toggleInputFocus('description', true);
//                       }}
//                       onBlur={() => {
//                         toggleInputFocus('description', false);
//                       }}
//                       onSubmitEditing={() => {
//                         // descriptionFocus.current.blur();
//                         amountFocus.current.focus();
//                       }}
//                       cursorColor={
//                         theme ? COLORS.darkModeText : COLORS.lightModeText
//                       }
//                       style={{
//                         ...styles.input,
//                         borderBottomColor: isInputFocused.description
//                           ? COLORS.nostrGreen
//                           : backgroundOffset,
//                       }}
//                       value={descriptionInput}
//                       keyboardType="default"
//                     />
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     onPress={() => {
//                       // amountFocus.current.focus();
//                       Keyboard.dismiss();
//                       setTimeout(() => {
//                         setIsAmountFocused(true);
//                         toggleInputFocus('amount', true);
//                       }, 200);
//                     }}
//                     style={[styles.inputContainer, {marginBottom: 20}]}>
//                     <View
//                       style={[
//                         styles.labelContainer,
//                         {
//                           backgroundColor: backgroundOffset,
//                         },
//                       ]}>
//                       <ThemeText
//                         styles={{fontSize: SIZES.small}}
//                         content={
//                           masterInfoObject.userBalanceDenomination != 'fiat'
//                             ? 'Sats'
//                             : nodeInformation.fiatStats.coin
//                         }
//                       />
//                     </View>

//                     <TextInput
//                       readOnly={true}
//                       style={[
//                         styles.input,
//                         {
//                           borderBottomColor: isInputFocused.amount
//                             ? COLORS.nostrGreen
//                             : backgroundOffset,
//                           color: textColor,
//                         },
//                       ]}
//                       value={formatBalanceAmount(amountPerPerson) || '0'}
//                       keyboardType="number-pad"
//                     />
//                   </TouchableOpacity>
//                   <View style={styles.bottomTextContainer}>
//                     <Text
//                       style={[
//                         styles.bottomText,
//                         {
//                           color: textColor,
//                         },
//                       ]}>
//                       Total sending amount:
//                     </Text>
//                     <TouchableOpacity
//                       activeOpacity={1}
//                       style={[styles.bottomButton]}>
//                       <FormattedSatText
//                         iconHeight={10}
//                         iconWidth={10}
//                         styles={{
//                           ...styles.bottomText,
//                           paddingVertical: 3,
//                           paddingHorizontal: 4,

//                           color: textColor,
//                         }}
//                         formattedBalance={formatBalanceAmount(
//                           amountPerPerson * addedContacts.length,
//                         )}
//                       />
//                       {/* <Text
//                         style={[
//                           styles.bottomText,
//                           {
//                             paddingVertical: 3,
//                             paddingHorizontal: 4,
//                             backgroundColor: theme
//                               ? COLORS.darkModeBackgroundOffset
//                               : COLORS.lightModeBackgroundOffset,
//                             color: theme
//                               ? COLORS.darkModeText
//                               : COLORS.lightModeText,
//                           },
//                         ]}>
//                         {formatBalanceAmount(
//                           amountPerPerson * addedContacts.length,
//                         )}{' '}
//                         {masterInfoObject.userBalanceDenomination != 'fiat'
//                           ? 'sats'
//                           : nodeInformation.fiatStats.coin}
//                       </Text> */}
//                     </TouchableOpacity>

//                     {/* <Text
//                     style={[
//                       styles.bottomText,
//                       {
//                         color: theme
//                           ? COLORS.darkModeText
//                           : COLORS.lightModeText,
//                       },
//                     ]}>
//                     Paid by
//                   </Text>
//                   <TouchableOpacity style={[styles.bottomButton]}>
//                     <Text
//                       style={[
//                         styles.bottomText,
//                         {
//                           paddingVertical: 3,
//                           paddingHorizontal: 4,
//                           backgroundColor: theme
//                             ? COLORS.darkModeBackgroundOffset
//                             : COLORS.lightModeBackgroundOffset,
//                           color: theme
//                             ? COLORS.darkModeText
//                             : COLORS.lightModeText,
//                         },
//                       ]}>
//                       you
//                     </Text>
//                   </TouchableOpacity>
//                   <Text
//                     style={[
//                       styles.bottomText,
//                       {
//                         color: theme
//                           ? COLORS.darkModeText
//                           : COLORS.lightModeText,
//                       },
//                     ]}>
//                     and split
//                   </Text>
//                   <TouchableOpacity
//                     style={[styles.bottomButton, {marginRight: 0}]}>
//                     <Text
//                       style={[
//                         styles.bottomText,
//                         {
//                           paddingVertical: 3,
//                           paddingHorizontal: 4,
//                           backgroundColor: theme
//                             ? COLORS.darkModeBackgroundOffset
//                             : COLORS.lightModeBackgroundOffset,
//                           color: theme
//                             ? COLORS.darkModeText
//                             : COLORS.lightModeText,
//                         },
//                       ]}>
//                       equally
//                     </Text>
//                   </TouchableOpacity>
//                   */}
//                   </View>
//                   {isAmountFocused && (
//                     <CustomNumberKeyboard
//                       showDot={
//                         masterInfoObject.userBalanceDenomination === 'fiat'
//                       }
//                       setInputValue={setAmountPerPerson}
//                       frompage={'contactsAutomatedPayments'}
//                     />
//                   )}
//                 </View>
//               )}
//             </>
//           )}
//           {/* </SafeAreaView> */}
//         </KeyboardAvoidingView>
//       </TouchableWithoutFeedback>
//     </GlobalThemeView>
//   );

//   function toggleInputFocus(input, isFocused) {
//     setIsInputFocused(prev => {
//       return {...prev, [input]: isFocused};
//     });
//   }

//   function sendGiveaway() {
//     if (!canSendGiveaway || isSendingGifts) return;

//     setIsSendingGifts(true);

//     const UUID = randomUUID();
//     const totalSendValue =
//       amountPerPerson * addedContacts.length + addedContacts.length * 300;

//     // this logic doesnt have to be here. Technicaly a user could have a split balance betwene liquid and lighting and two payments could come from liquid and the others could come from ln. I need to change this logic

//     if (liquidNodeInformation.userBalance > totalSendValue) {
//       console.log('USING LIQUID');
//       let sendingCount = 0;

//       addedContacts.forEach(contact => {
//         setTimeout(async () => {
//           console.log('SENT');

//           try {
//             const {receiveAddress} = contact;
//             console.log(receiveAddress, convertedBalanceAmount);

//             const didSend = await sendLiquidTransaction(
//               Number(convertedBalanceAmount),
//               receiveAddress,
//             );

//             if (!didSend) throw new Error('error sending payment');
//             pubishMessageToAbly(
//               contactsPrivateKey,
//               contact.uuid,
//               globalContactsInformation.myProfile.uuid,
//               JSON.stringify({
//                 amountMsat: convertedBalanceAmount * 1000,
//                 description: descriptionInput,
//                 uuid: UUID,
//                 isRequest: false,
//                 isRedeemed: true,
//               }),
//               globalContactsInformation,
//               toggleGlobalContactsInformation,
//               'send',
//               decodedAddedContacts,
//               publicKey,
//             );
//             setNumberOfGiftsSent(prev => prev + 1);
//           } catch (err) {
//             console.log(err);
//             setErrorMessage('Error sending some of the payments.');
//           }
//         }, sendingCount * 5000);
//         sendingCount += 1;
//       });
//     } else {
//       console.log('SWAPPING TO LIQUID ');
//       navigate.navigate('ErrorScreen', {
//         errorMessage: 'Lightning payments coming soon...',
//       });
//     }
//     // addedContacts
//     // amount per person
//     //description

//     console.log('TEST');
//   }

//   function sendPaymentRequests() {
//     if (isSendingGifts) return;

//     setIsSendingGifts(true);

//     let sendingCount = 0;

//     addedContacts.forEach(contact => {
//       setTimeout(async () => {
//         const UUID = randomUUID();
//         try {
//           pubishMessageToAbly(
//             contactsPrivateKey,
//             contact.uuid,
//             globalContactsInformation.myProfile.uuid,
//             JSON.stringify({
//               amountMsat: convertedBalanceAmount * 1000,
//               description: descriptionInput,
//               uuid: UUID,
//               isRequest: true,
//               isRedeemed: false,
//             }),
//             globalContactsInformation,
//             toggleGlobalContactsInformation,
//             'request',
//             decodedAddedContacts,
//             publicKey,
//           );
//           setNumberOfGiftsSent(prev => prev + 1);
//         } catch (err) {
//           console.log(err);
//           setErrorMessage('Error sending some of the payments.');
//         }
//       }, sendingCount * 2000);
//       sendingCount += 1;
//     });
//   }

//   function handleInput(event, isFocus) {
//     const targetEvent = event && event.nativeEvent.key;
//     const letterRegex = /^[a-zA-Z]$/;
//     const didInput = event && letterRegex.test(targetEvent);
//     console.log(didInput);

//     const inputLength = isFocus
//       ? inputedContact.length
//       : didInput
//       ? inputedContact.length + 1
//       : inputedContact.length - 1;

//     if (inputLength <= 0) {
//       if (inputLength < 0) {
//         console.log('DID RUN');
//         setAddedContacts(prev => {
//           let tempArr = [...prev];
//           tempArr.pop();
//           return tempArr.map((contact, id) => {
//             if (id + 1 === tempArr.length) contact['isSelected'] = true;
//             else contact['isSelected'] = false;
//             return contact;
//           });
//         });

//         return;
//       }
//       setAddedContacts(prev => {
//         return prev.map((contact, id) => {
//           if (id + 1 === addedContacts.length) contact['isSelected'] = true;
//           else contact['isSelected'] = false;
//           return contact;
//         });
//       });
//     } else {
//       setAddedContacts(prev => {
//         return prev.map((contact, id) => {
//           contact['isSelected'] = false;

//           return contact;
//         });
//       });
//     }
//   }
//   function clearPage() {
//     setAddedContacts([]);
//     setAmountPerPerson('');
//     setDescriptionInput('');
//     setNumberOfGiftsSent(0);
//     setIsSendingGifts(false);
//     setErrorMessage('');
//   }
// }

// function SerchFilteredContactsList({
//   filterTerm,
//   contacts,
//   addedContacts,
//   setAddedContacts,
//   setInputedContact,
//   navigation,
//   contactsImages,
// }) {
//   // const filterTerm = props.filterTerm;
//   // const contacts = props.contacts;

//   // const addedContacts = props.addedContacts;
//   // const setAddedContacts = props.setAddedContacts;

//   const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();

//   const filteredContact = contacts
//     .filter(contact => {
//       return (
//         (contact.name.toLowerCase().startsWith(filterTerm.toLowerCase()) ||
//           contact.uniqueName
//             .toLowerCase()
//             .startsWith(filterTerm.toLowerCase())) &&
//         addedContacts.filter(addedContact => {
//           return addedContact.uuid === contact.uuid;
//         }).length === 0
//       );
//     })
//     .map((contact, id) => {
//       return (
//         <TouchableOpacity
//           key={id}
//           onPress={() => {
//             setAddedContacts(prev => {
//               let tempArr = [...prev];
//               tempArr.push(contact);
//               return tempArr;
//             });
//             setInputedContact('');
//           }}>
//           <View style={styles.contactRowContainer}>
//             <View
//               style={[
//                 styles.contactImageContainer,
//                 {
//                   backgroundColor: backgroundOffset,
//                 },
//               ]}>
//               <Image
//                 source={
//                   contact.profileImage
//                     ? {uri: contact.profileImage}
//                     : ICONS.userIcon
//                 }
//                 style={
//                   contact.profileImage
//                     ? {width: '100%', height: undefined, aspectRatio: 1}
//                     : {width: '50%', height: '50%'}
//                 }
//               />

//               {contact.unlookedTransactions != 0 && (
//                 <View style={styles.hasNotification}></View>
//               )}
//             </View>
//             <View style={{flex: 1}}>
//               <Text style={[styles.contactText, {color: textColor}]}>
//                 {contact.uniqueName}
//               </Text>
//               <Text
//                 style={[
//                   styles.contactText,
//                   {fontSize: SIZES.small, color: textColor},
//                 ]}>
//                 {contact.name || 'No name set'}
//               </Text>
//             </View>
//           </View>
//         </TouchableOpacity>
//       );
//     });

//   return filteredContact.length === 0 ? (
//     <NoContactsFoundPage navigation={navigation} />
//   ) : (
//     filteredContact
//   );
// }

// function NoContactsFoundPage(props) {
//   const {textColor} = GetThemeColors();

//   return (
//     <View style={styles.noContactsContainer}>
//       {/* <Image
//         style={{width: 100, height: 100, marginBottom: 20, marginTop: 20}}
//         source={ICONS.logoIcon}
//       /> */}
//       <View>
//         <Text
//           style={[
//             styles.noContactsContainerText,
//             {
//               color: textColor,
//             },
//           ]}>
//           Blitz can help notify givaway recipients. To enable, add a contact.
//         </Text>
//       </View>
//       <CustomButton
//         buttonStyles={{width: 'auto'}}
//         textContent={'Add contact'}
//         actionFunction={() => {
//           props.navigation.jumpTo('Add Contact');
//         }}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   topBar: {
//     width: '100%',
//     flexDirection: 'row',
//     alignItems: 'center',
//     ...CENTER,
//   },
//   backButton: {
//     width: 20,
//     height: 20,
//   },

//   contentContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   contactsListContainer: {
//     width: '100%',
//     height: '100%',
//     ...CENTER,
//   },
//   contactsListHeader: {
//     fontFamily: FONT.Title_Regular,
//     fontSize: SIZES.medium,

//     marginTop: 10,
//   },

//   noContactsContainer: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   noContactsContainerText: {
//     fontFamily: FONT.Title_Regular,
//     fontSize: SIZES.medium,
//     textAlign: 'center',
//     marginTop: 40,
//     marginBottom: 20,
//   },
//   noContactsContainerBTN: {
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     borderRadius: 8,

//     backgroundColor: COLORS.primary,
//   },

//   givawayInfoContainer: {
//     height: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   inputContainer: {
//     width: '100%',
//     flexDirection: 'row',
//   },

//   labelContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 8,
//     borderWidth: 1,
//     marginRight: 12.5,

//     alignItems: 'center',
//     justifyContent: 'center',

//     ...SHADOWS.small,
//   },

//   labelIcon: {
//     width: 25,
//     height: 25,
//   },

//   input: {
//     width: '79%',
//     includeFontPadding: false,
//     borderBottomWidth: 2,

//     fontSize: SIZES.large,
//     fontFamily: FONT.Descriptoin_Regular,

//     // ...SHADOWS.medium,
//   },

//   bottomTextContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   bottomText: {
//     fontFamily: FONT.Descriptoin_Regular,
//     fontSize: SIZES.small,
//   },
//   bottomButton: {
//     borderRadius: 3,
//     overflow: 'hidden',
//     borderColor: COLORS.opaicityGray,
//     borderWidth: 1,
//     marginHorizontal: 10,
//     paddingHorizontal: 5,
//   },

//   contactRowContainer: {
//     width: '100%',
//     overflow: 'hidden',
//     flexDirection: 'row',
//     alignItems: 'center',
//     ...CENTER,
//     marginVertical: 5,
//   },

//   contactImageContainer: {
//     width: 35,
//     height: 35,
//     backgroundColor: COLORS.opaicityGray,
//     alignItems: 'center',
//     justifyContent: 'center',

//     borderRadius: 20,
//     marginRight: 10,
//     overflow: 'hidden',
//   },
//   contactImage: {
//     width: 25,
//     height: 30,
//   },
//   contactText: {
//     width: '100%',
//     fontFamily: FONT.Title_Regular,
//     fontSize: SIZES.medium,
//   },

//   myProfileContainer: {},

//   //completed container
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
