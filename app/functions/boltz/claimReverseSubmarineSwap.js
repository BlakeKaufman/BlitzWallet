import {WebView} from 'react-native-webview';

const html = require('boltz-swap-web-context');

const getClaimReverseSubmarineSwapJS = ({
  address,
  swapInfo,
  preimage,
  privateKey,
}) => {
  const args = JSON.stringify({
    apiUrl: process.env.BOLTZ_API,
    network: 'testnet',
    address,
    feeRate: 1,
    swapInfo,
    privateKey,
    preimage,
  });
  console.log(args, 'WINDOW ARGUMENT');

  return `window.claimReverseSubmarineSwap(${args}); void(0);`;
};

export const ClaimReverseSubmarineSwap = ({
  address,
  swapInfo,
  preimage,
  privateKey,
}) => {
  const handleClaimMessage = event => {
    console.log('RUNNING');
    try {
      console.log(event);
      const data = JSON.parse(event.nativeEvent.data);

      if (data.error) throw Error(data.error);
      console.log(data, 'DATA FROM WEBVIEW');

      (async () => {
        try {
          await axios.post(
            `${process.env.BOLTZ_API}/v2/chain/L-BTC/transaction`,
            {
              hex: data,
            },
          );
        } catch (err) {
          console.log(err);
        }
      })();
    } catch (err) {
      console.log(err, 'WEBVIEW ERROR');
    }
  };

  <WebView
    source={html}
    originWhitelist={['*']}
    injectedJavaScript={getClaimReverseSubmarineSwapJS({
      address,
      swapInfo,
      preimage,
      privateKey,
    })}
    onMessage={handleClaimMessage}
  />;
};

// ClaimReverseSubmarineSwap({
//   address:
//     'tlq1qqwzhruh7fhr60kt8ea8deqsvjzlz555079jeje78wd4sk000dyqzke9g00560gdqtenqqnv77sexfn45ghr2u3z32wrkjzgsr',
//   swapInfo: {
//     id: 'atTd3AsoU2fh',
//     invoice:
//       'lntb15u1pny2qdfpp5ezuaqwww2f6rxa43ppemxq4twr79080em29m8hna2a972py4a20qdpz2djkuepqw3hjqnpdgf2yxgrpv3j8yetnwvcqz95xqyp2xqsp5rqw9qhhj6gv4wqn56t6xxpn6vcgqueznkul4s89044ahwdz57xgq9qyyssq7ullepkktkq7zxvsnq5myc8v994cjrf06e9rxjmxdrm8hpesyxtx6vk3qf7dtpm5hn86us9g44ufdcu9va2uq4v7x52j8j8t7uppcasqsze7h2',
//     swapTree: {
//       claimLeaf: {
//         version: 196,
//         output:
//           '82012088a91440596e936bc948347d5e973e9ad8487311a99c298820182e057c4faa19077a1979c6e859a75a06c7dd09fc965760ba73ea956b4b6c02ac',
//       },
//       refundLeaf: {
//         version: 196,
//         output:
//           '204e639d00d50e7ba51a68bb7996d4027d873c58f06bb322a57a60e1a47ca56251ad032c4915b1',
//       },
//     },
//     blindingKey:
//       'ce923fd54559e4156513e987b86020dbf51ae14e786ba9825bbcee34a8f5ae16',
//     lockupAddress:
//       'tlq1pqv02u3sfekywlpznhxywh77nx208qwc9m7yv3x6l4sf37sqev8cesdh6gw8sypskkkkj0j70cpyqqwt594m45w5y9j0jh5ry6kmxjddm6sqqpdvspsl9',
//     refundPublicKey:
//       '024e639d00d50e7ba51a68bb7996d4027d873c58f06bb322a57a60e1a47ca56251',
//     timeoutBlockHeight: 1394988,
//     onchainAmount: 1220,
//   },
//   preimage:
//     'c8b9d039ce52743376b10873b302ab70fc579df9da8bb3de7d574be50495ea9e',
//   privateKey:
//     '278a08d44d2a0faa0362e4c93b6762b8ce190775dbf9876da312b549a9e47732',
// });
