import {ConfirmLeaveChatGPT} from './homeComponents/apps';
import AddChatGPTCredits from './homeComponents/apps/chatGPT/addCreditsPage';
import CameraModal from './homeComponents/cameraModal';
import ClipboardCopyPopup from './homeComponents/confirmClipboard';
import {
  AddContactPage,
  ContactsPage,
  EditMyProfilePage,
  ExpandedContactsPage,
  MyContactProfilePage,
  SendAndRequestPage,
} from './homeComponents/contacts';
import {
  GivawayHome,
  AutomatedPayments,
} from './homeComponents/contacts/automatedPayments/index.js';
import AddOrDeleteContactImage from './homeComponents/contacts/internalComponents/addOrDeleteImageScreen';
import ConfirmAddContact from './homeComponents/contacts/internalComponents/confimAddFriendPopup';
import ContactsPageLongPressActions from './homeComponents/contacts/internalComponents/contactsPageLongPressActions';
import ErrorScreen from './homeComponents/errorScreen';
import {
  FaucetHome,
  FaucetReceivePage,
  FaucetSettingsPage,
  FaucetSendPage,
} from './homeComponents/faucet';
import AmountToGift from './homeComponents/fundGift/amountToGift';
import HowToSteps from './homeComponents/fundGift/howToSteps';
import GiftWalletConfirmation from './homeComponents/fundGift/popups/giftWalletConfirmation';
// import LetterKeyboard from './homeComponents/globalComponents/letterKeyboard';
// import NumberKeyboard from './homeComponents/globalComponents/numberKeyboard';
import HomeLightning from './homeComponents/homeLightning';
import HalfModalSendOptions from './homeComponents/homeLightning/halfModalSendOptions';
import LiquidityIndicator from './homeComponents/homeLightning/liquidityIndicator';
import {SendRecieveBTNs} from './homeComponents/homeLightning/sendReciveBTNs';
import {UserSatAmount} from './homeComponents/homeLightning/userSatAmount';
import {UserTransactions} from './homeComponents/homeLightning/userTransactions';

import NavBar from './homeComponents/navBar';
import {
  ButtonsContainer,
  EditReceivePaymentInformation,
  RefundBitcoinTransactionPage,
  ViewInProgressSwap,
} from './homeComponents/receiveBitcoin';
import SwitchReceiveOptionPage from './homeComponents/receiveBitcoin/switchReceiveOptionPage';
import LnurlPaymentDescription from './homeComponents/sendBitcoin/lnurlPaymentDescription';

import SendPaymentScreen from './homeComponents/sendBitcoin/sendPaymentScreen';

import {
  AboutPage,
  BiometricLoginPage,
  BlitzSocialOptions,
  ConfirmActionPage,
  DisplayOptions,
  DrainPage,
  DrainWalletAddress,
  FiatCurrencyPage,
  FundWalletGift,
  GainsCalculator,
  LSPPage,
  LspDescriptionPopup,
  NodeInfo,
  NosterWalletConnect,
  RefundFailedLiquidSwaps,
  ResetPage,
  SeedPhrasePage,
  SendOnChainBitcoin,
  UserBalanceDenomination,
} from './homeComponents/settingsContent';
import LiquidSettingsPage from './homeComponents/settingsContent/bankComponents/settingsPage';
import HasNWCAccount from './homeComponents/settingsContent/nwc/hasAccount';
import NoNWCAccount from './homeComponents/settingsContent/nwc/noAccount';
import HomeLogin from './loginComponents/home';
import PinPage from './loginComponents/pinPage';

export {
  NavBar,
  HomeLightning,
  CameraModal,
  BlitzSocialOptions,
  SendOnChainBitcoin,
  SeedPhrasePage,
  ResetPage,
  RefundFailedLiquidSwaps,
  NosterWalletConnect,
  NodeInfo,
  LSPPage,
  GainsCalculator,
  FundWalletGift,
  FiatCurrencyPage,
  DrainPage,
  DisplayOptions,
  BiometricLoginPage,
  AboutPage,
  UserBalanceDenomination,
  ConfirmActionPage,
  DrainWalletAddress,
  LspDescriptionPopup,
  HasNWCAccount,
  NoNWCAccount,
  SendPaymentScreen,
  RefundBitcoinTransactionPage,
  ButtonsContainer,
  EditReceivePaymentInformation,
  SwitchReceiveOptionPage,
  ViewInProgressSwap,
  LiquidityIndicator,
  SendRecieveBTNs,
  UserSatAmount,
  AmountToGift,
  HowToSteps,
  GiftWalletConfirmation,
  FaucetHome,
  FaucetReceivePage,
  FaucetSettingsPage,
  HomeLogin,
  PinPage,
  ClipboardCopyPopup,
  HalfModalSendOptions,
  LnurlPaymentDescription,
  FaucetSendPage,
  AddContactPage,
  ExpandedContactsPage,
  EditMyProfilePage,
  MyContactProfilePage,
  SendAndRequestPage,
  ErrorScreen,
  AutomatedPayments,
  ConfirmLeaveChatGPT,
  AddChatGPTCredits,
  ContactsPage,
  UserTransactions,
  ConfirmAddContact,
  ContactsPageLongPressActions,
  LiquidSettingsPage,
  // NumberKeyboard,
  // LetterKeyboard,
  AddOrDeleteContactImage,
};
