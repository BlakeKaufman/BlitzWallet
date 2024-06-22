import {useState, useEffect} from 'react';
import {useGlobalContextProvider} from '../../context-store/context';
import {listPayments, nodeInfo} from '@breeztech/react-native-breez-sdk';

export function updateLightningBalance() {
  const {breezContextEvent, toggleNodeInformation} = useGlobalContextProvider();

  useEffect(() => {
    (async () => {
      console.log('RUNNING IN LN LISTENR ON HOMPAGE');
      try {
        const nodeState = await nodeInfo();
        let transactions = await listPayments({});

        const userBalance = nodeState.channelsBalanceMsat / 1000;
        const inboundLiquidityMsat = nodeState.inboundLiquidityMsats;
        const blockHeight = nodeState.blockHeight;
        const onChainBalance = nodeState.onchainBalanceMsat;

        console.log(
          userBalance,
          inboundLiquidityMsat,
          blockHeight,
          onChainBalance,
        );

        const nodeInfoObject = {
          transactions: transactions,
          userBalance: userBalance,

          inboundLiquidityMsat: inboundLiquidityMsat,

          blockHeight: blockHeight,
          onChainBalance: onChainBalance,
        };

        toggleNodeInformation(nodeInfoObject);
        // await setLocalStorageItem(
        //   'breezInfo',
        //   JSON.stringify([
        //     nodeInfoObject.transactions,
        //     nodeInfoObject.userBalance,
        //     nodeInfoObject.inboundLiquidityMsat,
        //     nodeInfoObject.blockHeight,
        //     nodeInfoObject.onChainBalance,
        //   ]),
        // );
      } catch (err) {
        console.log(err);
      }
    })();
  }, [breezContextEvent]);
}
