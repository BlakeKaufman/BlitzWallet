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
  'Ecash -> LN swap',
  'Internal_Transfer',
];

const WEBSITE_REGEX =
  /^(https?:\/\/|www\.)[a-z\d]([a-z\d-]*[a-z\d])*(\.[a-z]{2,})+/i;
const hasSpace = /\s/;

const VALID_URL_REGEX =
  /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const VALID_USERNAME_REGEX = /^(?=.*\p{L})[\p{L}\p{N}_]+$/u;
const BITCOIN_SATS_ICON = '₿';

const ECASH_TX_STORAGE_KEY = 'CASHU_TRANSACTIONS';
const AUTO_CHANNEL_REBALANCE_STORAGE_KEY = 'ACR_STORAGE_KEY';
const ECASH_KEYSET_STORAGE = 'ECASH_KEYSET_STORAGE';
const BREEZ_WORKING_DIR_KEY = 'BREEZ_WORKING_DIR';
const QUICK_PAY_STORAGE_KEY = 'FAST_PAY_SETTINGS';
const LOGIN_SECUITY_MODE_KEY = 'LOGIN_SECURITY_MODE';

const BLITZ_DEFAULT_PAYMENT_DESCRIPTION = 'Blitz Wallet';

const CHATGPT_INPUT_COST = 10 / 1000000;
const CHATGPT_OUTPUT_COST = 30 / 1000000;

const MIN_CHANNEL_OPEN_FEE = 500000;
const MAX_CHANNEL_OPEN_FEE = 1000000;
const BLITZ_RECEIVE_FEE = 0.0;
const BLITZ_SEND_FEE = 0.0;
const LIQUID_DEFAULT_FEE = 26;

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
  BLITZ_RECEIVE_FEE,
  BLITZ_SEND_FEE,
  AUTO_CHANNEL_REBALANCE_STORAGE_KEY,
  ECASH_KEYSET_STORAGE,
  BREEZ_WORKING_DIR_KEY,
  QUICK_PAY_STORAGE_KEY,
  BLITZ_DEFAULT_PAYMENT_DESCRIPTION,
  LOGIN_SECUITY_MODE_KEY,
  LIQUID_DEFAULT_FEE,
  BITCOIN_SATS_ICON,
};
