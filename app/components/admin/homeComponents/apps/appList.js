import {ICONS} from '../../../../constants';

const APPLIST = [
  {
    name: 'ChatGPT',
    iconLight: ICONS.chatgptLight,
    iconDark: ICONS.chatgptDark,
    description: 'Chatbot powered by gpt-4o',
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
    name: 'SMS',
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
  {
    name: 'Soon',
    svgName: 'clock',
    description: 'More apps are coming soon!',
    pageName: 'soon',
  },
];

export {APPLIST};
