// import {
//   Keyboard,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
// } from 'react-native';
// import {ThemeText} from '../../../../../functions/CustomElements';
// import {SIZES, WINDOWWIDTH} from '../../../../../constants/theme';
// import {CENTER, ICONS} from '../../../../../constants';
// import ThemeImage from '../../../../../functions/CustomElements/themeImage';
// import {useNavigation} from '@react-navigation/native';
// import {useGlobalAppData} from '../../../../../../context-store/appData';
// import GiftCardLoginPage from './loginPage';
// import GiftCardPage from './giftCardsPage';

// export default function ShopBitcoinHome() {
//   const {decodedGiftCards} = useGlobalAppData();
//   console.log(decodedGiftCards);

//   return (
//     <>
//       {decodedGiftCards?.profile?.user?.email &&
//       decodedGiftCards?.profile?.password ? (
//         <GiftCardLoginPage />
//       ) : (
//         <GiftCardPage />
//       )}
//     </>
//   );
// }
