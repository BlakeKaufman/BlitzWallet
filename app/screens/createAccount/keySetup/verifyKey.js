// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   Platform,
//   ScrollView,
// } from 'react-native';
// import {Back_BTN, DynamicKeyContainer} from '../../../components/login';
// import {BTN, Background, CENTER, COLORS, FONT, SIZES} from '../../../constants';
// import {useEffect, useState} from 'react';
// import {retrieveData, shuffleArray} from '../../../functions';
// import {useTranslation} from 'react-i18next';
// import {GlobalThemeView} from '../../../functions/CustomElements';

// export default function VerifyKey({navigation: {navigate}}) {
//   const [mnemonic, setMnemonic] = useState([]);
//   const [validationMnemonic, setValidationMnemonic] = useState([]);
//   const [currentGuess, setCurrentGuess] = useState(['', 0]);
//   const [headerText, setHeaderText] = useState('');
//   const [isValid, setIsValid] = useState(false);
//   const {t} = useTranslation();

//   useEffect(() => {
//     (async () => {
//       const data = await retrieveData('mnemonic');
//       const tempValidation = shuffleArray(data.split(' ')).map(string => [
//         string, //name
//         false, // is selected
//         null, // is correct
//         null, // num selected
//       ]);

//       setMnemonic(data.split(' '));

//       setValidationMnemonic(tempValidation);
//     })();
//   }, []);

//   function countGuesses(id) {
//     validationMnemonic.forEach(item => {
//       if (item[0] === id) {
//         if (!item[1]) setCurrentGuess(prev => [id, (prev[1] += 1)]);
//         else setCurrentGuess(prev => [id, (prev[1] -= 1)]);
//       }
//     });
//   }
//   useEffect(() => {
//     setValidationMnemonic(prev => {
//       return prev.map(key => {
//         const correctPos =
//           mnemonic.indexOf(currentGuess[0]) == currentGuess[1] - 1;

//         if (key[0] === currentGuess[0]) {
//           return [key[0], !key[1], correctPos, key[1] ? null : currentGuess[1]];
//         } else return key;
//       });
//     });
//   }, [currentGuess]);

//   useEffect(() => {
//     let text;
//     const newArr = validationMnemonic.filter(key => key[1] && !key[2]);
//     if (newArr.length === 0 && currentGuess[1] != 12) {
//       text = t('createAccount.verifyKeyPage.startHeader');
//     } else if (newArr.length > 0) {
//       text = t('createAccount.verifyKeyPage.incorrectGuess').replace(
//         'blank',
//         numToStringNum(currentGuess[1]),
//       );
//     } else {
//       text = t('createAccount.verifyKeyPage.allCorrect');
//     }

//     setHeaderText(text);
//   }, [validationMnemonic, currentGuess]);

//   useEffect(() => {
//     setIsValid(
//       validationMnemonic.filter(key => key[1] && !key[2]).length === 0 &&
//         currentGuess[1] === 12,
//     );
//   }, [validationMnemonic, currentGuess]);

//   return (
//     <GlobalThemeView>
//       <Back_BTN navigation={navigate} destination="GenerateKey" />
//       <View style={styles.container}>
//         <Text style={styles.header}>{headerText}</Text>
//         <View style={{flex: 1}}>
//           <ScrollView>
//             <DynamicKeyContainer
//               countGuesses={countGuesses}
//               for="keyVarify"
//               keys={validationMnemonic}
//             />
//           </ScrollView>
//         </View>
//         <TouchableOpacity
//           onPress={nextPage}
//           style={[
//             BTN,
//             isValid
//               ? styles.container_withClick
//               : styles.container_withoutClick,
//             {marginTop: 'auto'},
//           ]}>
//           <Text style={styles.continueText}>
//             {t('createAccount.verifyKeyPage.continueBTN')}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </GlobalThemeView>
//   );

//   function numToStringNum(num) {
//     switch (num) {
//       case 1:
//         return t('createAccount.verifyKeyPage.position.1');
//       case 2:
//         return t('createAccount.verifyKeyPage.position.2');
//       case 3:
//         return t('createAccount.verifyKeyPage.position.3');
//       case 4:
//         return t('createAccount.verifyKeyPage.position.4');
//       case 5:
//         return t('createAccount.verifyKeyPage.position.5');
//       case 6:
//         return t('createAccount.verifyKeyPage.position.6');
//       case 7:
//         return t('createAccount.verifyKeyPage.position.7');
//       case 8:
//         return t('createAccount.verifyKeyPage.position.8');
//       case 9:
//         return t('createAccount.verifyKeyPage.position.9');
//       case 10:
//         return t('createAccount.verifyKeyPage.position.10');
//       case 11:
//         return t('createAccount.verifyKeyPage.position.11');
//       case 12:
//         return t('createAccount.verifyKeyPage.position.12');
//       default:
//         break;
//     }
//   }
//   function nextPage() {
//     if (!isValid) return;
//     navigate('PinSetup', {isInitialLoad: true});
//   }
// }

// const styles = StyleSheet.create({
//   global_container: {
//     flex: 1,
//   },
//   container: {
//     width: '95%',
//     maxWidth: 400,
//     flex: 1,
//     alignItems: 'center',

//     marginRight: 'auto',
//     marginLeft: 'auto',
//   },
//   header: {
//     width: '95%',
//     maxWidth: 320,
//     fontSize: SIZES.large,
//     fontFamily: FONT.Title_Bold,
//     fontWeight: 'bold',

//     textAlign: 'center',

//     ...CENTER,
//     marginVertical: 20,
//     color: COLORS.lightModeText,
//   },
//   showMeAgain: {
//     marginTop: 'auto',
//     marginBottom: 20,
//   },
//   continueBTN: {
//     marginTop: 'unset',
//   },

//   showMe_container: {
//     width: '90%',
//     height: 45,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'transparent',

//     borderWidth: 1,
//     marginBottom: 20,
//     marginTop: 'auto',
//   },
//   showMeText: {
//     fontSize: SIZES.large,
//     fontFamily: FONT.Other_Regular,
//     color: COLORS.lightModeText,
//   },

//   container_withClick: {
//     width: '90%',
//     height: 45,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,

//     opacity: 1,
//   },
//   container_withoutClick: {
//     width: '90%',
//     height: 45,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,

//     opacity: 0.2,
//   },
//   continueText: {
//     color: COLORS.white,
//     fontSize: SIZES.large,
//     fontFamily: FONT.Other_Regular,
//   },
// });
