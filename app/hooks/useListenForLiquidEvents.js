// import {useEffect} from 'react';
// import {updateLiquidWalletInformation} from '../functions/liquidWallet';

// export default function useListenForLiquidEvents({
//   toggleLiquidNodeInformation,
//   liquidNodeInformation,
//   didGetToHomepage,
// }) {
//   useEffect(() => {
//     if (!didGetToHomepage) return;
//     setInterval(
//       () =>
//         updateLiquidWalletInformation({
//           toggleLiquidNodeInformation,
//           liquidNodeInformation,
//         }),
//       1000 * 60,
//     );
//   }, [didGetToHomepage]);
// }
// // DO NOT NEED ANYMORE
