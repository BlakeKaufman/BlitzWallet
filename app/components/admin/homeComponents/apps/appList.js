import {ICONS} from '../../../../constants';

const APPLIST = [
  {
    name: 'ChatGPT',
    iconLight: ICONS.chatgptLight,
    iconDark: ICONS.chatgptDark,
    description: 'Chatbot powered by chatGPT 3.5',
    pageName: 'chatGPT',
  },
  // {
  //   name: 'Point Of Sale',
  //   iconLight: ICONS.posLight,
  //   iconDark: ICONS.posDark,
  //   description: 'Simple point of sale system for merchants',
  //   pageName: 'POS',
  // },
  // {
  //   name: 'Restaurant',
  //   iconLight: ICONS.resturantIconLight,
  //   iconDark: ICONS.resturantIconDark,
  //   description: 'Order food directly from your wallet',
  //   pageName: 'resturant',
  // },
  {
    name: 'Messaging',
    iconLight: ICONS.messagesLight,
    iconDark: ICONS.messagesDark,
    description: 'Send and Receive sms messages',
    pageName: 'sms4sats',
  },
  {
    name: 'VPN',
    svgName: 'shield',
    description: 'Securely browse and protect privacy',
    pageName: 'lnvpn',
  },
];

export {APPLIST};
