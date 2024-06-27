import axios from 'axios';
import {getBoltzApiUrl} from './boltzEndpoitns';

export default async function getBoltzFeeRates() {
  try {
    const response = await axios.get(
      `${getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT)}/v2/chain/fees`,
    );

    return response.data['L-BTC'];
  } catch (err) {
    return false;
    console.log(err);
  }
}
