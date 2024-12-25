import {createBoltzSwapKeys} from '../../../../../functions/boltz/createKeys';
import {getBoltzApiUrl} from '../../../../../functions/boltz/boltzEndpoitns';
import crypto from 'react-native-quick-crypto';
import {Buffer} from 'buffer';
import sha256Hash from '../../../../../functions/hash';
import customUUID from '../../../../../functions/customUUID';

export async function contactsLNtoLiquidSwapInfo(
  liquidAddress,
  swapAmountSats,
  description,
) {
  try {
    const {publicKey, privateKeyString, keys} = await createBoltzSwapKeys();
    const preimage = crypto.randomBytes(32);

    const preimageHash = sha256Hash(preimage);

    console.log(customUUID(), 'CUSTOM UUID');

    const signature = keys.signSchnorr(
      sha256Hash(Buffer.from(liquidAddress, 'utf-8')),
    );

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
          claimPublicKey: publicKey,
          from: 'BTC',
          invoiceAmount: swapAmountSats,
          preimageHash: preimageHash,
          to: 'L-BTC',
          referralId: 'blitzWallet',
          description: description || 'Contacts payment',
        }),
      },
    );

    const data = await response.json();
    console.log(data);

    // const data = (
    //   await axios.post(
    //     `${getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT)}/v2/swap/reverse`,
    //     {
    //       address: liquidAddress,
    //       addressSignature: signature.toString('hex'),
    //       claimPublicKey: keys.publicKey.toString('hex'),
    //       from: 'BTC',
    //       invoiceAmount: swapAmountSats,
    //       preimageHash: preimageHash,
    //       to: 'L-BTC',
    //       referralId: 'blitzWallet',
    //       description: description || 'Contacts payment',
    //     },
    //   )
    // ).data;

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
