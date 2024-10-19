import {retrieveData, storeData} from '../secureStore';

import {assetIDS} from './assetIDS';
import {Wollet, Client, Signer, Network, TxBuilder} from 'lwk-rn';
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from '../localStorage';
import {
  getCurrentDateFormatted,
  isMoreThanADayOld,
} from '../rotateAddressDateChecker';
import getLiquidAddressInfo from './lookForLiquidPayment';
import {Platform} from 'react-native';
const network =
  process.env.BOLTZ_ENVIRONMENT === 'testnet'
    ? Network.Testnet
    : Network.Mainnet;

let wolletState;
let clientState;
let signerState;
let isTransactionInProgress = false;

async function getWolletState() {
  console.log('GET WOLLET STATE FUNCTION');
  if (wolletState && clientState && signerState)
    return {wolletState, clientState, signerState};

  console.log('RUNNION ACTUALL LOGIC TO GET WOLLET STATEW');
  try {
    const mnemonic = await generateLiquidMnemonic();
    signerState = await new Signer().create(mnemonic, network);
    const descriptor = await signerState.wpkhSlip77Descriptor();

    wolletState = await new Wollet().create(network, descriptor, null);
    clientState = await new Client().defaultElectrumClient(network);

    return {
      wolletState: wolletState,
      clientState: clientState,
      signerState: signerState,
    };
  } catch (err) {
    return false;
  }
}

async function getWalletInfo() {
  try {
    const mnemonic = await generateLiquidMnemonic();
    const signer = await new Signer().create(mnemonic, network);
    const descriptor = await signer.wpkhSlip77Descriptor();

    const wollet = await new Wollet().create(network, descriptor, null);

    const client = await new Client().defaultElectrumClient(network);
    const update = await client.fullScan(wollet);
    await wollet.applyUpdate(update);

    console.log('GET WALLET INFOR');

    return {network, signer, descriptor, wollet, client};
  } catch (err) {
    return false;
  }
}
async function startGDKSession() {
  try {
    const didStart = await getWalletInfo();
    if (!didStart) throw Error('DIDNT START');
    return true;
  } catch (err) {
    console.log(err, 'START SESSSION ERROR');
    return false;
  }
}

async function generateLiquidMnemonic() {
  try {
    const retrivedMnemonic = await retrieveData('mnemonic');
    const filteredMnemonic = retrivedMnemonic
      .split(' ')
      .filter(item => item)
      .join(' ');

    retrivedMnemonic != filteredMnemonic &&
      storeData('mnemonic', filteredMnemonic);

    console.log(filteredMnemonic, 'FILTERED MNEMOINC');

    return new Promise(resolve => {
      resolve(filteredMnemonic);
    });
  } catch (err) {
    console.log(err, 'GENERATE MNEMONIC ERROR');
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

// async function getTxDetail(txhash) {
//   try {
//     const txDetail = await gdk.getTransactionDetails(txhash);
//     return new Promise(resolve => {
//       resolve(txDetail);
//     });
//   } catch (error) {
//     console.log('ERROR', error);
//     return new Promise(resolve => {
//       resolve(false);
//     });
//   }
// }

// async function getLiquidFees() {
//   try {
//     const fees = await gdk.getFeeEstimates();

//     return new Promise(resolve => resolve(fees));
//   } catch (error) {
//     console.log('ERROR', error);
//     return new Promise(resolve => resolve(false));
//   }
// }

async function createLiquidReceiveAddress() {
  try {
    const storedLiquidAddress = JSON.parse(
      await getLocalStorageItem('liquidAddress'),
    );

    // if (!storedLiquidAddress || isMoreThanADayOld(storedLiquidAddress[1])) {
    if (
      !storedLiquidAddress ||
      (process.env.BOLTZ_ENVIRONMENT === 'liquid' &&
        storedLiquidAddress[0].includes('t')) ||
      (process.env.BOLTZ_ENVIRONMENT === 'testnet' &&
        storedLiquidAddress[0].startsWith('l')) ||
      isMoreThanADayOld(storedLiquidAddress[1])
    ) {
      const {wolletState} = await getWolletState();
      // const mnemonic = await generateLiquidMnemonic();
      // const signer = await new Signer().create(mnemonic, network);
      // const descriptor = await signer.wpkhSlip77Descriptor();
      // const wollet = await new Wollet().create(network, descriptor, null);

      const adressNumber = await updateLiquidReceiveAddressNumber();
      const address = await wolletState.getAddress(
        Platform.OS === 'ios' ? String(adressNumber) : adressNumber,
      );

      setLocalStorageItem(
        'liquidAddress',
        JSON.stringify([address.description, getCurrentDateFormatted()]),
      );
      return {address: address.description};
    } else {
      return {address: storedLiquidAddress[0]};
    }
  } catch (error) {
    console.log('LIQUID ADDRESS ERROR', error);
    return false;
  }
}
async function getLiquidTransactions() {
  try {
    const {wolletState, clientState} = await getWolletState();
    // const mnemonic = await generateLiquidMnemonic();
    // const signer = await new Signer().create(mnemonic, network);
    // const descriptor = await signer.wpkhSlip77Descriptor();

    // const wollet = await new Wollet().create(network, descriptor, null);

    // const client = await new Client().defaultElectrumClient(network);
    const update = await clientState.fullScan(wolletState);
    await wolletState.applyUpdate(update);

    const transactions = await wolletState.getTransactions();
    return transactions;
  } catch (error) {
    console.log('LIQUID TRANSACTIONS', error);
    return false;
  }
}
async function getLiquidBalance() {
  try {
    const {wolletState, clientState} = await getWolletState();
    // const mnemonic = await generateLiquidMnemonic();
    // const signer = await new Signer().create(mnemonic, network);
    // const descriptor = await signer.wpkhSlip77Descriptor();

    // const wollet = await new Wollet().create(network, descriptor, null);

    // const client = await new Client().defaultElectrumClient(network);
    const update = await clientState.fullScan(wolletState);
    await wolletState.applyUpdate(update);

    const userBalance = await wolletState.getBalance();

    console.log(userBalance[assetIDS['L-BTC']]);

    return userBalance[assetIDS['L-BTC']];
  } catch (error) {
    console.log('LLIQUID BALANCE ERROR', error);
    return false;
  }
}

async function getLiquidTxFee({amountSat, address}) {
  try {
    const {wolletState, clientState, signerState} = await getWolletState();
    // const mnemonic = await generateLiquidMnemonic();
    // const signer = await new Signer().create(mnemonic, network);
    // const descriptor = await signer.wpkhSlip77Descriptor();
    // const wollet = await new Wollet().create(network, descriptor, null);
    // const client = await new Client().defaultElectrumClient(network);
    const update = await clientState.fullScan(wolletState);
    await wolletState.applyUpdate(update);

    const address =
      process.env.BOLTZ_ENVIRONMENT === 'liquid'
        ? process.env.BLITZ_LIQUID_ADDRESS
        : process.env.BLITZ_LIQUID_TESTNET_ADDRESS;
    console.log(amountSat, address, '!');

    const fee_rate = process.env.BOLTZ_ENVIRONMENT === 'testnet' ? 12 : 100; // this is the sat/vB * 100 fee rate. Example 280 would equal a fee rate of .28 sat/vB. 100 would equal .1 sat/vB

    const builder = await new TxBuilder().create(network);

    await builder.addLbtcRecipient(address, amountSat);

    await builder.feeRate(fee_rate);

    let pset = await builder.finish(wolletState);

    let signed_pset = await signerState.sign(pset);
    let finalized_pset = await wolletState.finalize(signed_pset);
    const tx = await finalized_pset.extractTx();

    return await tx.fee(assetIDS['L-BTC']);
  } catch (error) {
    console.log('ERROR', error);
    return new Promise(resolve => resolve(false));
  }
}

async function getLiquidBalanceAndTransactions() {
  try {
    const {wolletState, clientState} = await getWolletState();
    console.log('UPDATE LIQUID BALANCE AND TRANSACTIONS FUNCTION');
    // const mnemonic = await generateLiquidMnemonic();
    // const signer = await new Signer().create(mnemonic, network);
    // const descriptor = await signer.wpkhSlip77Descriptor();

    // const wollet = await new Wollet().create(network, descriptor, null);

    // const client = await new Client().defaultElectrumClient(network);
    const update = await clientState.fullScan(wolletState);
    await wolletState.applyUpdate(update);

    const userBalance = await wolletState.getBalance();
    const transactions = await wolletState.getTransactions();

    return {
      transactions: transactions,
      balance: userBalance[assetIDS['L-BTC']],
    };
  } catch (error) {
    console.log('LLIQUID BALANCE ERROR', error);
    return false;
  }
}

async function sendLiquidTransaction(amountSat, address, doesNeedToWait) {
  try {
    const {wolletState, clientState, signerState} = await getWolletState();
    isTransactionInProgress = true;
    // const mnemonic = await generateLiquidMnemonic();
    // const signer = await new Signer().create(mnemonic, network);
    // const descriptor = await signer.wpkhSlip77Descriptor();
    // const wollet = await new Wollet().create(network, descriptor, null);
    // const client = await new Client().defaultElectrumClient(network);
    const update = await clientState.fullScan(wolletState);
    await wolletState.applyUpdate(update);

    const fee_rate = process.env.BOLTZ_ENVIRONMENT === 'testnet' ? 12 : 100; // this is the sat/vB * 100 fee rate. Example 280 would equal a fee rate of .28 sat/vB. 100 would equal .1 sat/vB
    const builder = await new TxBuilder().create(network);
    await builder.addLbtcRecipient(address, amountSat);
    await builder.feeRate(fee_rate);
    let pset = await builder.finish(wolletState);
    let signed_pset = await signerState.sign(pset);
    let finalized_pset = await wolletState.finalize(signed_pset);
    const tx = await finalized_pset.extractTx();
    await clientState.broadcast(tx);

    // if (doesNeedToWait) {
    //   return new Promise(resolve => {
    //     setTimeout(() => {
    //       resolve(true);
    //     }, 5000); // Delay for 5 seconds
    //   });
    // } else {
    return true;
    // }
  } catch (error) {
    console.log('SEND PAYMENT ERROR', error);
    return false;
  } finally {
    isTransactionInProgress = false;
  }
}
export const updateLiquidWalletInformation = async ({
  toggleLiquidNodeInformation,
  liquidNodeInformation,
  firstLoad,
}) => {
  if (isTransactionInProgress) return true;
  const {balance, transactions} = await getLiquidBalanceAndTransactions();
  if (typeof balance != 'number' || typeof transactions != 'object')
    return false;

  toggleLiquidNodeInformation({
    transactions: transactions,
    userBalance: balance,
  });
  return {transactions: transactions, balance: balance};

  console.log('UPDATING LIQUID WALLET INFORMATION');

  // const balance = await getLiquidBalance();
  const liquidAddress = await createLiquidReceiveAddress();
  const liquidAddressInfo = await getLiquidAddressInfo({
    address: liquidAddress.address,
  });

  console.log(liquidAddressInfo, 'LIQUID ADRES INFO ');
  const prevTxCount = JSON.parse(
    await getLocalStorageItem('prevAddressTxCount'),
  );

  if (!liquidAddressInfo && !firstLoad) return true;

  if (liquidAddressInfo?.chain_stats?.tx_count == prevTxCount && !firstLoad)
    return true;

  // const {balance, transactions} = await getLiquidBalanceAndTransactions();

  if (typeof balance != 'number' || typeof transactions != 'object')
    return false;

  toggleLiquidNodeInformation({
    transactions: transactions,
    userBalance: balance,
  });
  if (!liquidAddressInfo) return true;
  setLocalStorageItem(
    'prevAddressTxCount',
    JSON.stringify(liquidAddressInfo.chain_stats.tx_count),
  );
  return true;
};

async function updateLiquidReceiveAddressNumber() {
  try {
    let localStoredNum = JSON.parse(
      await getLocalStorageItem('addressNumTracker'),
    );
    if (localStoredNum) {
      localStoredNum += 1;
    } else {
      localStoredNum = 1;
    }

    setLocalStorageItem('addressNumTracker', JSON.stringify(localStoredNum));
    return Number(localStoredNum);
  } catch (err) {
    console.log('ERROR IN UPDATING LIQUID RECEIVE ADDRESS:', err);
    return 1;
  }
}

export {
  generateLiquidMnemonic,
  startGDKSession,
  // gdk,
  // getSubAccounts,
  // createSubAccount,
  sendLiquidTransaction,
  createLiquidReceiveAddress,
  // getLiquidFees,
  // getTxDetail,
  getLiquidTxFee,
  getLiquidTransactions,
  getLiquidBalance,
  getLiquidBalanceAndTransactions,
};
