export default function hasAlredyPaidInvoice({
  scannedAddress,
  nodeInformation,
  liquidNodeInformation,
}) {
  const didPayWithLiquid = liquidNodeInformation.transactions.find(
    tx =>
      tx?.destination === scannedAddress && tx?.details?.type === 'lightning',
  );
  const didPayWithLightning = nodeInformation.transactions.find(
    tx => tx.details.data.bolt11 === scannedAddress,
  );
  return !!didPayWithLiquid || !!didPayWithLightning;
}
