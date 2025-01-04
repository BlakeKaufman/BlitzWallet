export async function getMempoolReccomenededFee(speed = 'halfHourFee') {
  try {
    const mempoolResponse = await fetch(
      'https://mempool.space/api/v1/fees/recommended',
    );
    const feeInfo = await mempoolResponse.json();
    return feeInfo[speed];
  } catch (err) {
    return false;
  }
}
