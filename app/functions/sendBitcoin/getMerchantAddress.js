const merchants = [
  {
    id: 'picknpay',
    identifierRegex: /(?<identifier>.*za\.co\.electrum\.picknpay.*)/iu,
    defaultDomain: 'cryptoqr.net',
    domains: {
      liquid: 'cryptoqr.net',
      testnet: 'staging.cryptoqr.net',
      regtest: 'staging.cryptoqr.net',
    },
  },
  {
    id: 'ecentric',
    identifierRegex: /(?<identifier>.*za\.co\.ecentric.*)/iu,
    defaultDomain: 'cryptoqr.net',
    domains: {
      liquid: 'cryptoqr.net',
      testnet: 'staging.cryptoqr.net',
      regtest: 'staging.cryptoqr.net',
    },
  },
];

export const convertMerchantQRToLightningAddress = ({qrContent, network}) => {
  if (!qrContent) {
    return null;
  }

  for (const merchant of merchants) {
    const match = qrContent.match(merchant.identifierRegex);
    if (match?.groups?.identifier) {
      const domain = merchant.domains[network] || merchant.defaultDomain;
      return `${encodeURIComponent(match.groups.identifier)}@${domain}`;
    }
  }

  return null;
};
