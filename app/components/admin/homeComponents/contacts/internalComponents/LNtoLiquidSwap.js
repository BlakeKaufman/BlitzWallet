import {createBoltzSwapKeys} from '../../../../../functions/boltz/createKeys';
import {getBoltzApiUrl} from '../../../../../functions/boltz/boltzEndpoitns';
import crypto from 'react-native-quick-crypto';
import {Buffer} from 'buffer';

import customUUID from '../../../../../functions/customUUID';
import {sha256} from 'liquidjs-lib/src/crypto';
import {BLITZ_DEFAULT_PAYMENT_DESCRIPTION} from '../../../../../constants';

export async function contactsLNtoLiquidSwapInfo(
  liquidAddress,
  swapAmountSats,
  description,
) {
  try {
    const {publicKey, privateKeyString, keys} = await createBoltzSwapKeys();
    const preimage = crypto.randomBytes(32);

    const preimageHash = sha256(preimage).toString('hex');

    const signature = Buffer.from(
      keys.signSchnorr(sha256(Buffer.from(liquidAddress, 'utf-8'))),
    ).toString('hex');

    const response = await fetch(
      `${getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT)}/v2/swap/reverse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: liquidAddress,
          addressSignature: signature,
          claimPublicKey: Buffer.from(keys.publicKey).toString('hex'),
          from: 'BTC',
          invoiceAmount: swapAmountSats,
          preimageHash: preimageHash,
          to: 'L-BTC',
          referralId: 'blitzWallet',
          description: description || BLITZ_DEFAULT_PAYMENT_DESCRIPTION,
        }),
      },
    );

    const data = await response.json();
    console.log(data);

    return new Promise(resolve => {
      resolve([
        data,
        Buffer.from(keys.publicKey).toString('hex'),
        Buffer.from(keys.privateKey).toString('hex'),
        keys,
        preimage.toString('hex'),
        liquidAddress,
      ]);
    });
  } catch (err) {
    console.log(err, 'ERR');
    return new Promise(resolve => {
      resolve(false);
    });
  }
}
