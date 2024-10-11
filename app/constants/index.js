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
const hasSpace = /\s/;

const VALID_URL_REGEX =
  /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const VALID_USERNAME_REGEX = /^(?=.*\p{L})[\p{L}\p{N}_]+$/u;

const ECASH_TX_STORAGE_KEY = 'CASHU_TRANSACTIONS';

const CHATGPT_INPUT_COST = 10 / 1000000;
const CHATGPT_OUTPUT_COST = 30 / 1000000;

const MIN_CHANNEL_OPEN_FEE = 500000;
const MAX_CHANNEL_OPEN_FEE = 1000000;

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
  hasSpace,
  ECASH_TX_STORAGE_KEY,
  VALID_URL_REGEX,
  CHATGPT_INPUT_COST,
  CHATGPT_OUTPUT_COST,
  MIN_CHANNEL_OPEN_FEE,
  MAX_CHANNEL_OPEN_FEE,
  EMAIL_REGEX,
  VALID_USERNAME_REGEX,
};
