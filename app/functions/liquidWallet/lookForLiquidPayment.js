const liquidMainnet = 'https://blockstream.info/liquid/api/';
const liquidTestnet = 'https://blockstream.info/liquidtestnet/api/';

export default async function getLiquidAddressInfo({address}) {
  try {
    const response = await fetch(
      `${
        process.env.BOLTZ_ENVIRONMENT === 'testnet'
          ? liquidTestnet
          : liquidMainnet
      }address/${address}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    console.log(response, 'TEST RESPONE');
    return await response.json();
  } catch (err) {
    console.log(err);
    return false;
  }
}
