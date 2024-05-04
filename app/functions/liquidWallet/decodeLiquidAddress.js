import {address as liquidAddress, networks} from 'liquidjs-lib';

export const decodeLiquidAddress = addr => {
  // We always do this to validate the network
  const script = liquidAddress.toOutputScript(addr, networks.testnet);

  // This throws for unconfidential addresses -> fallback to output script decoding
  try {
    const decoded = liquidAddress.fromConfidential(addr);
    console.log(decoded, 'decoded');

    return {script, blindingKey: decoded.blindingKey};
  } catch (e) {
    if (script) return {script};
    return false;
  }
};
