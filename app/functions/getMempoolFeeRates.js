export async function getMempoolReccomenededFee(numberOfConfs = '2') {
  try {
    const blockstreamResponse = await fetch(
      'https://blockstream.info/api/fee-estimates',
    );
    const feeInfo = await blockstreamResponse.json();
    return Math.round(feeInfo[numberOfConfs]);
  } catch (err) {
    return false;
  }
}
