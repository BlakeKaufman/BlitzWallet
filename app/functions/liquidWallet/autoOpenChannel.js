import {receivePayment} from '@breeztech/react-native-breez-sdk';
import createLiquidToLNSwap from '../boltz/liquidToLNSwap';

export default async function autoOpenChannel(
  nodeInformation,
  liquidNodeInformation,
  masterInfoObject,
  toggleMasterInfoObject,
) {
  if (!masterInfoObject.liquidWalletSettings.regulateChannelOpen)
    return new Promise(resolve => resolve(true));

  if (
    liquidNodeInformation.userBalance <
    masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize
  )
    return new Promise(resolve => resolve(true));

  const invoice = await receivePayment({
    amountMsat:
      masterInfoObject.liquidWalletSettings.regulatedChannelOpenSize * 1000,
    description: 'Auto Channel Open',
  });

  if (invoice) {
    const {swapInfo, privateKey} = await createLiquidToLNSwap(
      invoice.lnInvoice.bolt11,
    );
    const refundJSON = {
      id: swapInfo.id,
      asset: 'L-BTC',
      version: 3,
      privateKey: privateKey,
      blindingKey: swapInfo.blindingKey,
      claimPublicKey: swapInfo.claimPublicKey,
      timeoutBlockHeight: swapInfo.timeoutBlockHeight,
      swapTree: swapInfo.swapTree,
    };

    toggleMasterInfoObject({
      liquidSwaps: [...masterInfoObject.liquidSwaps].concat(refundJSON),
    });

    const webSocket = new WebSocket(
      `${process.env.BOLTZ_API.replace(
        'https://',
        'wss://',
      )}/api.boltz.exchange/v2/ws`,
    );
    webSocket.onopen = () => {
      console.log('did un websocket open');
      webSocket.send(
        JSON.stringify({
          op: 'subscribe',
          channel: 'swap.update',
          args: [swapInfo.id],
        }),
      );
    };

    webSocket.onmessage = async rawMsg => {
      const msg = JSON.parse(rawMsg.data);

      console.log(msg);

      if (msg.args[0].status === 'invoice.paid') {
        webSocket.close();
        return new Promise(resolve => resolve(true));
      }
    };

    const didSend = await sendLiquidTransaction(
      swapInfo.expectedAmount,
      swapInfo.address,
    );

    if (!didSend) {
      webSocket.close();
      new Promise(resolve => resolve(false));
    }
  } else {
    new Promise(resolve => resolve(false));
  }
}
