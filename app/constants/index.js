import {COLORS, FONT, SIZES, SHADOWS} from './theme';
import ICONS from './icons';
import {CENTER, BTN, Background} from './styles';
import {SATSPERBITCOIN} from './math';

const BLOCKED_NAVIGATION_PAYMENT_CODES = [
  'Redeemed Gift Code',
  'Givaway',
  'bwsfd',
  'contacts payment',
  'BW-POS',
  'Auto Channel Rebalance',
  'Auto Channel Open',
  'Store - chatGPT',
];

const WEBSITE_REGEX =
  /^(https?:\/\/|www\.)[a-z\d]([a-z\d-]*[a-z\d])*(\.[a-z]{2,})+/i;

export {
  COLORS,
  FONT,
  SIZES,
  SHADOWS,
  ICONS,
  CENTER,
  BTN,
  Background,
  SATSPERBITCOIN,
  BLOCKED_NAVIGATION_PAYMENT_CODES,
  WEBSITE_REGEX,
};
