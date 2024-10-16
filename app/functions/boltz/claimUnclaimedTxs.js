import axios from 'axios';
import {getLocalStorageItem, setLocalStorageItem} from '../localStorage';
import {getBoltzApiUrl} from './boltzEndpoitns';

export default async function claimUnclaimedBoltzSwaps() {
  const savedBoltzTXs = JSON.parse(await getLocalStorageItem('boltzClaimTxs'));

  if (!savedBoltzTXs) return true;

  // First, map over the array and perform the async operation for each item
  let newBoltzTx = await Promise.all(
    savedBoltzTXs.map(async swap => {
      try {
        await axios.post(
          `${getBoltzApiUrl(
            process.env.BOLTZ_ENVIRONMENT,
          )}/v2/chain/L-BTC/transaction`,
          {hex: swap[0]},
        );
        // If the API call is successful, exclude this transaction
        return null;
      } catch (err) {
        console.log(err);
        // If the API call fails, include this transaction
        return swap;
      }
    }),
  );

  // Filter out any null values (successful transactions)
  newBoltzTx = newBoltzTx.filter(tx => tx !== null);

  // Save to local storage
  setLocalStorageItem('boltzClaimTxs', JSON.stringify(newBoltzTx));
}
