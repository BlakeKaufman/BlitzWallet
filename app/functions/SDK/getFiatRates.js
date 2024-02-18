import {fetchFiatRates} from '@breeztech/react-native-breez-sdk';

export default async function getFiatRates() {
  try {
    const fiatRates = await fetchFiatRates();
    return new Promise((resolve, request) => {
      resolve(fiatRates);
    });
  } catch (err) {
    console.log(err);
  }
}
