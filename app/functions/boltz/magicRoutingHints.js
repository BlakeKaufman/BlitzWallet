import axios from 'axios';
import {crypto} from 'liquidjs-lib';
import bolt11 from 'bolt11';

import {ECPairFactory} from 'ecpair';
import * as ecc from '@bitcoinerlab/secp256k1';
import {getBoltzApiUrl} from './boltzEndpoitns';
import * as bip21 from 'bip21';
import {assetIDS} from '../liquidWallet/assetIDS';

const ECPair = ECPairFactory(ecc);
import {Buffer} from 'buffer';

const magicRoutingHintConstant = '0846c900051c0000';

const findMagicRoutingHint = invoice => {
  const decodedInvoice = bolt11.decode(invoice);
  const routingInfo = decodedInvoice.tags.find(
    tag => tag.tagName === 'routing_info',
  );
  if (routingInfo === undefined) {
    return {decodedInvoice};
  }

  const magicRoutingHint = routingInfo.data.find(
    hint => hint.short_channel_id === magicRoutingHintConstant,
  );
  if (magicRoutingHint === undefined) {
    return {decodedInvoice};
  }

  return {magicRoutingHint, decodedInvoice};
};

export const getLiquidFromSwapInvoice = async invoice => {
  try {
    const {magicRoutingHint, decodedInvoice} = findMagicRoutingHint(invoice);
    if (magicRoutingHint === undefined) {
      // Pay via Swap
      console.log('no magic routing hint found');
      return;
    }

    console.log(
      magicRoutingHint,
      decodedInvoice,
      getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT),
    );
    const bip21Res = (
      await axios.get(
        `${getBoltzApiUrl(
          process.env.BOLTZ_ENVIRONMENT,
        )}/v2/swap/reverse/${invoice}/bip21`,
      )
    ).data;

    const receiverPublicKey = ECPair.fromPublicKey(
      Buffer.from(magicRoutingHint.pubkey, 'hex'),
    );
    const receiverSignature = Buffer.from(bip21Res.signature, 'hex');

    console.log(bip21Res);

    const bip21Decoded = bip21.decode(
      bip21Res.bip21,
      process.env.BOLTZ_ENVIRONMENT === 'liquid'
        ? 'liquidnetwork'
        : 'liquidtestnet',
    );
    console.log(bip21Decoded);

    const bip21Address = bip21Decoded.address;
    const amount = bip21Decoded.options.amount;
    const assetID = bip21Decoded.options.assetid;

    const addressHash = crypto.sha256(Buffer.from(bip21Address, 'utf-8'));

    if (!receiverPublicKey.verifySchnorr(addressHash, receiverSignature)) {
      throw 'invalid address signature';
    }

    if (assetID !== assetIDS['L-BTC']) {
      throw 'invalid BIP-21 asset';
    }

    // Amount in the BIP-21 is the amount the recipient will actually receive
    // The invoice amount includes service and swap onchain fees
    if (Number(amount) * 10 ** 8 > Number(decodedInvoice.satoshis)) {
      throw 'invalid BIP-21 amount';
    }

    // Pay on Liquid

    return {invoice: decodedInvoice, liquidAddress: bip21Address};
  } catch (err) {
    return false;
  }
};
