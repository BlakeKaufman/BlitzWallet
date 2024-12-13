// import {
//   Keyboard,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
// } from 'react-native';
// import {GlobalThemeView} from '../../../../functions/CustomElements';
// import {ICONS, WEBSITE_REGEX} from '../../../../constants';
// import {useNavigation} from '@react-navigation/native';
// import {useCallback, useEffect, useState} from 'react';
// import openWebBrowser from '../../../../functions/openWebBrowser';
// import handleBackPress from '../../../../hooks/handleBackPress';
// import {CENTER} from '../../../../constants/styles';
// import {WINDOWWIDTH} from '../../../../constants/theme';
// import CustomButton from '../../../../functions/CustomElements/button';
// import ThemeImage from '../../../../functions/CustomElements/themeImage';
// import {useTranslation} from 'react-i18next';
// import CustomSearchInput from '../../../../functions/CustomElements/searchInput';

// export default function ManualEnterSendAddress() {
//   const navigate = useNavigation();
//   const {t} = useTranslation();

//   const [inputValue, setInputValue] = useState('');
//   const handleBackPressFunction = useCallback(() => {
//     navigate.goBack();
//     return true;
//   }, [navigate]);

//   useEffect(() => {
//     handleBackPress(handleBackPressFunction);
//   }, [handleBackPressFunction]);

//   return (
//     <GlobalThemeView useStandardWidth={true}>
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : null}
//           style={{flex: 1}}>
//           <TouchableOpacity
//             onPress={() => {
//               Keyboard.dismiss();
//               setTimeout(() => {
//                 navigate.goBack();
//               }, 200);
//             }}
//             style={{width: WINDOWWIDTH, ...CENTER}}>
//             <ThemeImage
//               styles={styles.backArrow}
//               darkModeIcon={ICONS.smallArrowLeft}
//               lightModeIcon={ICONS.smallArrowLeft}
//               lightsOutIcon={ICONS.arrow_small_left_white}
//             />
//           </TouchableOpacity>

//           <View style={styles.innerContainer}>
//             <CustomSearchInput
//               textInputMultiline={true}
//               inputText={inputValue}
//               setInputText={setInputValue}
//               placeholderText={t('wallet.manualInputPage.inputPlaceholder')}
//               textInputStyles={styles.testInputStyle}
//               containerStyles={styles.textInputContianerSyles}
//               textAlignVertical={'top'}
//             />

//             <CustomButton
//               buttonStyles={{
//                 opacity: !inputValue ? 0.5 : 1,
//                 width: 'auto',
//                 marginTop: 'auto',
//                 marginBottom: Platform.OS == 'ios' ? 10 : 0,
//               }}
//               actionFunction={hanldeSubmit}
//               textContent={t('constants.accept')}
//             />
//           </View>
//         </KeyboardAvoidingView>
//       </TouchableWithoutFeedback>
//     </GlobalThemeView>
//   );
//   function hanldeSubmit() {
//     if (!inputValue) return;
//     Keyboard.dismiss();
//     if (WEBSITE_REGEX.test(inputValue)) {
//       openWebBrowser({navigate, link: inputValue});
//       return;
//     }
//     navigate.reset({
//       index: 0,
//       routes: [
//         {
//           name: 'HomeAdmin', // Navigate to HomeAdmin
//           params: {
//             screen: 'Home',
//           },
//         },
//         {
//           name: 'ConfirmPaymentScreen', // Navigate to HomeAdmin
//           params: {
//             btcAdress: inputValue,
//           },
//         },
//       ],
//     });
//   }
// }

// const styles = StyleSheet.create({
//   innerContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   textInputContianerSyles: {
//     width: '95%',
//     marginTop: 'auto',
//   },
//   testInputStyle: {
//     height: 150,
//   },
// });
