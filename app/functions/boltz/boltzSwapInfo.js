import axios from 'axios';
import {getBoltzApiUrl} from './boltzEndpoitns';

export async function getBoltzSwapPairInformation(swapType) {
  try {
    const request = await axios.get(
      `${getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT)}/v2/swap/${
        swapType === 'liquid-ln' ? 'submarine' : 'reverse'
      }`,
    );
    const data =
      swapType === 'liquid-ln'
        ? request.data['L-BTC']['BTC']
        : request.data['BTC']['L-BTC'];
    return new Promise(resolve => {
      resolve(data);
    });
  } catch (err) {
    console.log(err, 'ERR');
    return new Promise(resolve => {
      resolve(false);
    });
  }
}
