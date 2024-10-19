import {useState, useEffect} from 'react';
import {listPayments, nodeInfo} from '@breeztech/react-native-breez-sdk';

export function useUpdateLightningBalance({
  didGetToHomepage,
  breezContextEvent,
  toggleNodeInformation,
}) {
  const updateNodeInfo = async () => {
    console.log('RUNNING IN LN LISTENER ON HOMEPAGE');
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
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!didGetToHomepage) return;
    setInterval(() => updateNodeInfo(), 1000 * 30);
  }, [didGetToHomepage]);
  useEffect(() => {
    if (!breezContextEvent || !didGetToHomepage) return;
    updateNodeInfo();
  }, [breezContextEvent, didGetToHomepage]);
}
