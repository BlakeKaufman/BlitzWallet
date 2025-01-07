import * as bitcoin from 'bitcoinjs-lib';

export function createWatchOnlyWalletForBitcoin(descriptor) {
  const xpub = extractXpubFromDescriptor(descriptor);

  const network = bitcoin.networks.bitcoin;

  // Create a BIP32 node from the xpub
  const node = bitcoin.bip32.fromBase58(xpub, network);

  // Function to generate an address from an index
  function getAddress(index) {
    const child = node.derive(0).derive(index); // Derive path m/0/index
    const {address} = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network,
    });
    return address;
  }

  // Example: Generate the first 5 addresses
  const addresses = [];
  for (let i = 0; i < 5; i++) {
    addresses.push(getAddress(i));
  }

  return {
    xpub,
    addresses,
  };
}

function extractXpubFromDescriptor(descriptor) {
  const match = descriptor.match(/.*\]\((xpub.*)\).*/);
  if (match && match[1]) {
    return match[1];
  } else {
    throw new Error('Invalid descriptor format');
  }
}
