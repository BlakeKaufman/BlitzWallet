const liquidUrl = 'https://api.boltz.exchange';
const testnetUrl = 'https://api.testnet.boltz.exchange';

export const getBoltzApiUrl = network => {
  return network === 'testnet' ? testnetUrl : liquidUrl;
};

export const getBoltzWsUrl = network =>
  `${getBoltzApiUrl(network).replace('https://', 'wss://')}/v2/ws`;
