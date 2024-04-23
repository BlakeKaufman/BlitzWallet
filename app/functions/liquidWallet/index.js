import Gdk from '@vulpemventures/react-native-gdk';
import {deleteItem, retrieveData, storeData} from '../secureStore';
import {useEffect, useState} from 'react';
import {useGlobalContextProvider} from '../../../context-store/context';
import {assetIDS} from './assetIDS';

const gdk = Gdk();

async function startGDKSession() {
  try {
    gdk.init();
    gdk.createSession();
    gdk.connect('electrum-liquid', 'blitzWallet');
    const mnemonic = await generateLiquidMnemonic();

    try {
      await gdk.login({}, {mnemonic, password: ''});
    } catch (err) {
      await gdk.register({}, {mnemonic, password: ''});
      await gdk.login({}, {mnemonic, password: ''});
    }

    return new Promise(resolve => {
      resolve(true);
    });
  } catch (err) {
    console.log(err, 'START SESSSION ERROR');
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

async function generateLiquidMnemonic() {
  try {
    const retrivedMnemonic = JSON.parse(
      await retrieveData('LiquidWalletMnemonic'),
    );
    const mnemonic = retrivedMnemonic || gdk.generateMnemonic12();

    mnemonic === retrivedMnemonic ||
      storeData('LiquidWalletMnemonic', JSON.stringify(mnemonic));

    gdk.validateMnemonic(mnemonic);
    return new Promise(resolve => {
      resolve(mnemonic);
    });
  } catch (err) {
    console.log(err, 'GENERATE MNEMONIC ERROR');
    return new Promise(resolve => {
      resolve(false);
    });
  }
}
async function getSubAccounts() {
  try {
    const subaccounts = await gdk.getSubaccounts({refresh: false});

    if (subaccounts.subaccounts.length <= 1)
      throw new Error('need to create subAccount');

    return new Promise(resolve => {
      resolve(subaccounts);
    });
  } catch (error) {
    console.log('ERROR', error);
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

async function createSubAccount() {
  try {
    await gdk.createSubaccount({
      type: 'p2wpkh',
      name: 'SINGLE_SIG',
    });
    return new Promise(resolve => {
      resolve(true);
    });
  } catch (error) {
    console.log('ERROR', error);
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
    const address = await gdk.getReceiveAddress({subaccount: 1});

    return new Promise(resolve => resolve(address));
  } catch (error) {
    console.log('ERROR', error);
    return new Promise(resolve => resolve(false));
  }
}

async function sendLiquidTransaction(amountSat, address) {
  try {
    const unsignedTx = await gdk.createTransaction({
      addressees: [
        {
          address: address,
          asset_id: assetIDS['L-BTC'],
          satoshi: amountSat,
        },
      ],
      utxos: (
        await gdk.getUnspentOutputs({subaccount: 1, num_confs: 0})
      ).unspent_outputs,
    });
    const blinded = await gdk.blindTransaction(unsignedTx);
    const signed = await gdk.signTransaction(blinded);
    await gdk.sendTransaction(signed);
    return new Promise(resolve => resolve(true));
    console.log('SENT');
  } catch (error) {
    return new Promise(resolve => resolve(false));
    console.log('ERROR', error);
  }
}

function listenForLiquidEvents() {
  const {toggleLiquidNodeInformation} = useGlobalContextProvider();
  let receivedTransactions = [];

  useEffect(() => {
    gdk.addListener('transaction', async event => {
      console.log('transaction event', event);
      const txHash = event.transaction.txhash;
      if (receivedTransactions.includes(txHash)) return;
      receivedTransactions.push(txHash);

      const transactions = await gdk.getTransactions({
        subaccount: 1,
        first: 0,
        count: 10000,
      });

      const {[assetIDS['L-BTC']]: userBalance} = await gdk.getBalance({
        subaccount: 1,
        num_confs: 0,
      });

      toggleLiquidNodeInformation({
        transactions: transactions.transactions,
        userBalance: userBalance,
      });
    });

    return () => {
      gdk.removeListener('transaction');
    };
  }, []);
}

export {
  generateLiquidMnemonic,
  startGDKSession,
  gdk,
  getSubAccounts,
  listenForLiquidEvents,
  createSubAccount,
  sendLiquidTransaction,
  createLiquidReceiveAddress,
  getLiquidFees,
};
