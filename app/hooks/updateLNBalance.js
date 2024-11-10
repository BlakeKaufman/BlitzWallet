// import {useState, useEffect} from 'react';
// import {listPayments, nodeInfo} from '@breeztech/react-native-breez-sdk';
// import {getLocalStorageItem, setLocalStorageItem} from '../functions';

// export function useUpdateLightningBalance({
//   didGetToHomepage,
//   breezContextEvent,
//   toggleNodeInformation,
// }) {
//   const updateNodeInfo = async () => {
//     console.log('RUNNING IN LN LISTENER ON HOMEPAGE');
//     try {
//       const nodeState = await nodeInfo();
//       let transactions = await listPayments({});
//       const savedLNBalance =
//         JSON.parse(await getLocalStorageItem('LNBalance')) || 0;

//       const userBalance = nodeState.channelsBalanceMsat / 1000;
//       const inboundLiquidityMsat = nodeState.totalInboundLiquidityMsats;
//       const blockHeight = nodeState.blockHeight;
//       const onChainBalance = nodeState.onchainBalanceMsat;

//       console.log(
//         userBalance,
//         inboundLiquidityMsat,
//         blockHeight,
//         onChainBalance,
//       );

//       const nodeInfoObject = {
//         transactions: transactions,
//         userBalance: userBalance,
//         inboundLiquidityMsat: inboundLiquidityMsat,
//         blockHeight: blockHeight,
//         onChainBalance: onChainBalance,
//       };

//       // console.log('TOGGLING LN INFORMATION');
//       // setLocalStorageItem('LNBalance', JSON.stringify(userBalance));

//       toggleNodeInformation(nodeInfoObject);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     if (!didGetToHomepage) return;
//     setInterval(() => updateNodeInfo(), 1000 * 60);
//   }, [didGetToHomepage]);
//   useEffect(() => {
//     if (!breezContextEvent || !didGetToHomepage) return;
//     updateNodeInfo();
//   }, [breezContextEvent, didGetToHomepage]);
// }
