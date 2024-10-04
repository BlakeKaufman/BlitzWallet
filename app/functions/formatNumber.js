export default function formatBalanceAmount(amount) {
  if (!amount) {
    return '0';
  }

  let formattedAmt = amount
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    .replace(/,/g, ' ');

  return formattedAmt;
}
