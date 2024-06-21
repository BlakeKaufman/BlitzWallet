import {getBoltzApiUrl} from './boltzEndpoitns';

export default async function handleRefundSubmarineClaim({
  ref, //reqiured
  liquidAddress, //reqiured
  swapInfo, //reqiured
  privateKey, //reqiured
}) {
  getRefundSubmarineClaim({
    webViewRef: ref,
    address: liquidAddress,
    swapInfo,
    privateKey,
  });
}

function getRefundSubmarineClaim({webViewRef, address, swapInfo, privateKey}) {
  const args = JSON.stringify({
    apiUrl: getBoltzApiUrl(process.env.BOLTZ_ENVIRONMENT),
    network: process.env.BOLTZ_ENVIRONMENT,
    address,
    feeRate: 1,
    swapInfo,
    privateKey,
  });

  webViewRef.current.injectJavaScript(
    `window.refundSubmarineSwap(${args}); void(0);`,
  );
}
