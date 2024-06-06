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
    gdk.connect(
      process.env.BOLTZ_ENVIRONMENT === 'testnet'
        ? 'electrum-testnet-liquid'
        : 'electrum-liquid',
      'blitzWallet',
    );
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
    const retrivedMnemonic = await retrieveData('mnemonic');
    const filteredMnemonic = retrivedMnemonic
      .split(' ')
      .filter(item => item)
      .join(' ');

    retrivedMnemonic != filteredMnemonic &&
      storeData('mnemonic', filteredMnemonic);

    gdk.validateMnemonic(filteredMnemonic);
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
async function getSubAccounts() {
  try {
    const subaccounts = await gdk.getSubaccounts({refresh: false});

    if (subaccounts.subaccounts.length <= 1)
      throw new Error('need to create subAccount');

    return new Promise(resolve => {
      resolve(true);
    });
  } catch (error) {
    console.log('GET SUB ACCOUNT ERROR', error);
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
    console.log('CREATE SUB ACCOUNT ERROR', error);
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
    const didSend = await gdk.sendTransaction(signed);

    if (didSend) return new Promise(resolve => resolve(didSend));
    console.log('SENT');
  } catch (error) {
    console.log('ERROR', error);
    return new Promise(resolve => resolve(false));
  }
}

function listenForLiquidEvents() {
  const {toggleLiquidNodeInformation, liquidNodeInformation} =
    useGlobalContextProvider();

  const [receivedEvent, setReceivedEvent] = useState(null);

  useEffect(() => {
    if (!receivedEvent) return;
    (async () => {
      const isNewPayment =
        liquidNodeInformation.transactions.filter(
          savedTx => savedTx.txHash === receivedEvent.transaction.txhash,
        ).length != 0;

      if (isNewPayment) return;
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
    })();
  }, [receivedEvent]);

  useEffect(() => {
    let debounceTimeout;
    gdk.addListener(
      'transaction',
      debounce(event => {
        currentThHex = event.transaction.txhash;

        // Optionally, you can still check the txhash or other conditions before setting the event

        console.log('transaction event', event);
        setReceivedEvent(event);
      }, 5000),
    ); // 5000 milliseconds or 5 seconds debounce time

    return () => {
      gdk.removeListener('transaction');
    };

    function debounce(func, wait) {
      return function (...args) {
        const context = this;
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => func.apply(context, args), wait);
      };
    }
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
  getTxDetail,
};
