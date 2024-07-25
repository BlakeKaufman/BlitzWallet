import axios from 'axios';
import {createBoltzSwapKeys} from '../../../../../functions/boltz/createKeys';
import {getBoltzApiUrl} from '../../../../../functions/boltz/boltzEndpoitns';
import {sha256} from 'liquidjs-lib/src/crypto';
import crypto from 'react-native-quick-crypto';

export async function contactsLNtoLiquidSwapInfo(
  liquidAddress,
  swapAmountSats,
) {
  try {
    const {publicKey, privateKeyString, keys} = await createBoltzSwapKeys();
    const preimage = crypto.randomBytes(32);

    const preimageHash = sha256(preimage).toString('hex');

    const signature = keys.signSchnorr(
      sha256(Buffer.from(liquidAddress, 'utf-8')),
    );

    const data = (
      await axios.post(
        `${getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT)}/v2/swap/reverse`,
        {
          address: liquidAddress,
          addressSignature: signature.toString('hex'),
          claimPublicKey: keys.publicKey.toString('hex'),
          from: 'BTC',
          invoiceAmount: swapAmountSats,
          preimageHash: preimageHash,
          to: 'L-BTC',
          referralId: 'blitzWallet',
        },
      )
    ).data;

    return new Promise(resolve => {
      resolve([
        data,
        publicKey,
        privateKeyString,
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
