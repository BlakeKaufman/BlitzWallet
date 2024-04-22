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

function listenForLiquidEvents() {
  const {toggleLiquidNodeInformation} = useGlobalContextProvider();
  //   const [networkEvent, setNetworkEvent] = useState(null);
  //   const [transaction, setTransaction] = useState(null);
  // const [networkEvent,setNetworkEvent] = useState(null)
  // const [networkEvent,setNetworkEvent] = useState(null)
  let receivedTransactions = [];

  useEffect(() => {
    gdk.addListener('network', event => {
      console.log('network event', event);
      //   setNetworkEvent(event);
    });

    gdk.addListener('transaction', async event => {
      console.log('transaction event', event);
      const txHash = event.transaction.txhash;
      if (receivedTransactions.includes(txHash)) return;
      receivedTransactions.push(txHash);

      const transactions = await gdk.getTransactions({
        subaccount: 1,
        first: 0,
        count: 100,
      });

      const {[assetIDS['L-BTC']]: userBalance} = await gdk.getBalance({
        subaccount: 1,
        num_confs: 0,
      });

      toggleLiquidNodeInformation({
        transactions: transactions.transactions,
        userBalance: userBalance / 1000,
      });
    });

    return () => {
      gdk.removeListener('network');
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
};
