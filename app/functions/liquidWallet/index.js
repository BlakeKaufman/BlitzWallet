import {retrieveData, storeData} from '../secureStore';
import {useEffect, useState} from 'react';
// import {useGlobalContextProvider} from '../../../context-store/context';
import * as Filesystem from 'expo-file-system';

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
const network =
  process.env.BOLTZ_ENVIRONMENT === 'testnet'
    ? Network.Testnet
    : Network.Mainnet;
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

async function getTxDetail(txhash) {
  try {
    const txDetail = await gdk.getTransactionDetails(txhash);
    return new Promise(resolve => {
      resolve(txDetail);
    });
  } catch (error) {
    console.log('ERROR', error);
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

async function getLiquidFees() {
  try {
    const fees = await gdk.getFeeEstimates();

    return new Promise(resolve => resolve(fees));
  } catch (error) {
    console.log('ERROR', error);
    return new Promise(resolve => resolve(false));
  }
}

async function createLiquidReceiveAddress() {
  try {
    const storedLiquidAddress = JSON.parse(
      await getLocalStorageItem('liquidAddress'),
    );

    if (!storedLiquidAddress || isMoreThanADayOld(storedLiquidAddress[1])) {
      const mnemonic = await generateLiquidMnemonic();
      const signer = await new Signer().create(mnemonic, network);
      const descriptor = await signer.wpkhSlip77Descriptor();
      const wollet = await new Wollet().create(network, descriptor, null);

      const adressNumber = await updateLiquidReceiveAddressNumber();
      const address = await wollet.getAddress(adressNumber);

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
    const mnemonic = await generateLiquidMnemonic();
    const signer = await new Signer().create(mnemonic, network);
    const descriptor = await signer.wpkhSlip77Descriptor();

    const wollet = await new Wollet().create(network, descriptor, null);

    const client = await new Client().defaultElectrumClient(network);
    const update = await client.fullScan(wollet);
    await wollet.applyUpdate(update);

    const transactions = await wollet.getTransactions();
    return transactions;
  } catch (error) {
    console.log('LIQUID TRANSACTIONS', error);
    return false;
  }
}
async function getLiquidBalance() {
  try {
    const mnemonic = await generateLiquidMnemonic();
    const signer = await new Signer().create(mnemonic, network);
    const descriptor = await signer.wpkhSlip77Descriptor();

    const wollet = await new Wollet().create(network, descriptor, null);

    const client = await new Client().defaultElectrumClient(network);
    const update = await client.fullScan(wollet);
    await wollet.applyUpdate(update);

    const userBalance = await wollet.getBalance();

    console.log(userBalance[assetIDS['L-BTC']]);

    return userBalance[assetIDS['L-BTC']];
  } catch (error) {
    console.log('LLIQUID BALANCE ERROR', error);
    return false;
  }
}

async function getLiquidTxFee({amountSat, address}) {
  try {
    const mnemonic = await generateLiquidMnemonic();
    const signer = await new Signer().create(mnemonic, network);
    const descriptor = await signer.wpkhSlip77Descriptor();
    const wollet = await new Wollet().create(network, descriptor, null);
    const client = await new Client().defaultElectrumClient(network);
    const update = await client.fullScan(wollet);
    await wollet.applyUpdate(update);

    const address =
      process.env.BOLTZ_ENVIRONMENT === 'liquid'
        ? process.env.BLITZ_LIQUID_ADDRESS
        : process.env.BLITZ_LIQUID_TESTNET_ADDRESS;
    console.log(amountSat, address, '!');

    const fee_rate = 100; // this is the sat/vB * 100 fee rate. Example 280 would equal a fee rate of .28 sat/vB. 100 would equal .1 sat/vB

    const builder = await new TxBuilder().create(network);

    await builder.addLbtcRecipient(address, amountSat);

    await builder.feeRate(fee_rate);

    let pset = await builder.finish(wollet);

    let signed_pset = await signer.sign(pset);
    let finalized_pset = await wollet.finalize(signed_pset);
    const tx = await finalized_pset.extractTx();

    return await tx.fee(assetIDS['L-BTC']);
  } catch (error) {
    console.log('ERROR', error);
    return new Promise(resolve => resolve(false));
  }
}

async function getLiquidBalanceAndTransactions() {
  try {
    const mnemonic = await generateLiquidMnemonic();
    const signer = await new Signer().create(mnemonic, network);
    const descriptor = await signer.wpkhSlip77Descriptor();

    const wollet = await new Wollet().create(network, descriptor, null);

    const client = await new Client().defaultElectrumClient(network);
    const update = await client.fullScan(wollet);
    await wollet.applyUpdate(update);

    const userBalance = await wollet.getBalance();
    const transactions = await wollet.getTransactions();

    console.log(userBalance[assetIDS['L-BTC']]);

    return {
      transactions: transactions,
      balance: userBalance[assetIDS['L-BTC']],
    };
  } catch (error) {
    console.log('LLIQUID BALANCE ERROR', error);
    return false;
  }
}

async function sendLiquidTransaction(amountSat, address) {
  try {
    const mnemonic = await generateLiquidMnemonic();
    const signer = await new Signer().create(mnemonic, network);
    const descriptor = await signer.wpkhSlip77Descriptor();
    const wollet = await new Wollet().create(network, descriptor, null);
    const client = await new Client().defaultElectrumClient(network);
    const update = await client.fullScan(wollet);
    await wollet.applyUpdate(update);

    const fee_rate = 100; // this is the sat/vB * 100 fee rate. Example 280 would equal a fee rate of .28 sat/vB. 100 would equal .1 sat/vB
    const builder = await new TxBuilder().create(network);
    await builder.addLbtcRecipient(address, amountSat);
    await builder.feeRate(fee_rate);
    let pset = await builder.finish(wollet);
    let signed_pset = await signer.sign(pset);
    let finalized_pset = await wollet.finalize(signed_pset);
    const tx = await finalized_pset.extractTx();
    await client.broadcast(tx);

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, 5000); // Delay for 5 seconds
    });
  } catch (error) {
    console.log('SEND PAYMENT ERROR', error);
    return false;
  }
}
export const updateLiquidWalletInformation = async ({
  toggleLiquidNodeInformation,
  liquidNodeInformation,
  firstLoad,
}) => {
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

  if (liquidAddressInfo?.chain_stats?.tx_count == prevTxCount && !firstLoad)
    return true;

  const {balance, transactions} = await getLiquidBalanceAndTransactions();

  setLocalStorageItem(
    'prevAddressTxCount',
    JSON.stringify(liquidAddressInfo.chain_stats.tx_count),
  );
  toggleLiquidNodeInformation({
    transactions: transactions,
    userBalance: balance,
  });
  return true;
};

function listenForLiquidEvents({
  toggleLiquidNodeInformation,
  liquidNodeInformation,
  didGetToHomepage,
}) {
  useEffect(() => {
    if (!didGetToHomepage) return;
    setInterval(
      () =>
        updateLiquidWalletInformation({
          toggleLiquidNodeInformation,
          liquidNodeInformation,
        }),
      1500 * 60,
    );
  }, [didGetToHomepage]);
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
  listenForLiquidEvents,
  // createSubAccount,
  sendLiquidTransaction,
  createLiquidReceiveAddress,
  getLiquidFees,
  getTxDetail,
  getLiquidTxFee,
  getLiquidTransactions,
  getLiquidBalance,
  getLiquidBalanceAndTransactions,
};
