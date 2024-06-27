import axios from 'axios';
import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';
import {getBoltzApiUrl} from './boltzEndpoitns';

export default async function claimUnclaimedBoltzSwaps() {
  const savedBoltzTXs = JSON.parse(await getLocalStorageItem('boltzClaimTxs'));

  if (!savedBoltzTXs) return true;

  let newBoltzTx = savedBoltzTXs.filter(async swap => {
    try {
      const response = await axios.post(
        `${getBoltzApiUrl(
          process.env.BOLTZ_ENVIRONMENT,
        )}/v2/chain/L-BTC/transaction`,
        {
          hex: swap[0],
        },
      );
      return false;
    } catch (err) {
      console.log(err);
      return true;
    }
  });

  setLocalStorageItem('boltzClaimTxs', JSON.stringify(newBoltzTx));
}
