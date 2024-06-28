const liquidUrl = 'wss://api.sideswap.io/json-rpc-ws';
const testnetUrl = 'wss://api-testnet.sideswap.io/json-rpc-ws';

export const getSideSwapApiUrl = network => {
  return network === 'testnet' ? testnetUrl : liquidUrl;
};
