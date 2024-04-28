import axios from 'axios';

export async function getBoltzSwapPairInformation(swapType) {
  try {
    const request = await axios.get(
      swapType === 'liquid-ln'
        ? `${process.env.BOLTZ_API}/v2/swap/submarine`
        : `${process.env.BOLTZ_API}/v2/swap/reverse`,
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
