import {useEffect, useState} from 'react';
import {StyleSheet, View, Text, ActivityIndicator} from 'react-native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {CENTER, COLORS, FONT, SHADOWS, SIZES} from '../../../../constants';
import {assetIDS} from '../../../../functions/liquidWallet/assetIDS';
import {ThemeText} from '../../../../functions/CustomElements';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import FullLoadingScreen from '../../../../functions/CustomElements/loadingScreen';

export default function WalletInformation() {
  const [isCalculatingGains, setIsCalculatingGains] = useState(true);
  const [processStepText, setProcessStepText] = useState('');
  const {nodeInformation, theme, liquidNodeInformation, masterInfoObject} =
    useGlobalContextProvider();
  const [gainsInfo, setGainsInfo] = useState({
    totalGain: 0,
    initialValue: 0,
    currentValue: 0,
    totalSent: 0,
    totalReceived: 0,
  });
  const [walletInfo, setWalletInfo] = useState({
    oldestTx: '',
    totalSent: 0,
    totalReceived: 0,
  });

  useEffect(() => {
    if (
      nodeInformation.transactions.length === 0 &&
      liquidNodeInformation.transactions.length === 0
    ) {
      setProcessStepText('You have no transactions');
      return;
    }
    getWalletStats(nodeInformation, liquidNodeInformation);
  }, [getWalletStats, nodeInformation, liquidNodeInformation]);

  return (
    <>
      {isCalculatingGains ? (
        <FullLoadingScreen text={processStepText} />
      ) : (
        <View style={styles.innerContainer}>
          {/* <Text
            style={[
              styles.dateText,
              {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
            ]}>
            Price info through:{' '}
            {new Date(new Date() - 24 * 60 * 60 * 1000).toLocaleDateString()}
          </Text> */}
          <View
            style={[
              styles.gainsContainer,
              {
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
              },
            ]}>
            <View style={styles.gainTypeRow}>
              <ThemeText
                styles={{...styles.gainTypeText}}
                content="Oldest Transaction"
              />
              <ThemeText
                styles={{...styles.valueText}}
                content={walletInfo.oldestTx.toLocaleString()}
              />
            </View>
            {/* <View style={styles.gainTypeRow}>
              <Text
                style={[
                  styles.gainTypeText,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                Historical Value
              </Text>
              <Text
                style={[
                  styles.valueText,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                ${gainsInfo.initialValue.toLocaleString()}
              </Text>
            </View> */}
            {/* <View style={[styles.gainTypeRow]}>
              <Text
                style={[
                  styles.gainTypeText,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                Current Value
              </Text>
              <Text
                style={[
                  styles.valueText,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                ${gainsInfo.currentValue.toLocaleString()}
              </Text>
            </View> */}
            <View style={[styles.gainTypeRow]}>
              <ThemeText
                styles={{...styles.gainTypeText}}
                content="Total Sent"
              />
              <ThemeText
                styles={{...styles.valueText}}
                content={`${formatBalanceAmount(
                  numberConverter(
                    walletInfo.totalSent,
                    masterInfoObject.userBalanceDenomination,
                    nodeInformation,
                  ),
                )} ${
                  masterInfoObject.userBalanceDenomination != 'fiat'
                    ? 'sats'
                    : nodeInformation.fiatStats.coin
                }`}
              />
            </View>
            <View style={[styles.gainTypeRow, {marginBottom: 0}]}>
              <ThemeText
                styles={{...styles.gainTypeText}}
                content="Total Received"
              />
              <ThemeText
                styles={{...styles.valueText}}
                content={`${formatBalanceAmount(
                  numberConverter(
                    walletInfo.totalReceived,
                    masterInfoObject.userBalanceDenomination,
                    nodeInformation,
                  ),
                )} ${
                  masterInfoObject.userBalanceDenomination != 'fiat'
                    ? 'sats'
                    : nodeInformation.fiatStats.coin
                }`}
              />
            </View>
          </View>
          {/* <Text style={styles.errorText}>
            Becuase of the API we use to get the price data, these values are in
            USD.
          </Text> */}
        </View>
      )}
    </>
  );

  async function getWalletStats(nodeInformation, liquidNodeInformation) {
    setProcessStepText('Getting Historical Price');

    const oldestLNTx =
      nodeInformation.transactions.length != 0 &&
      new Date(
        nodeInformation.transactions[nodeInformation.transactions.length - 1]
          .paymentTime * 1000,
      );
    const oldestLiquidTX =
      liquidNodeInformation.transactions.length != 0 &&
      new Date(
        liquidNodeInformation.transactions[
          liquidNodeInformation.transactions.length - 1
        ].created_at_ts / 1000,
      );
    console.log(oldestLiquidTX, oldestLNTx);
    const oldestPayment = !oldestLNTx
      ? oldestLiquidTX
      : !oldestLiquidTX
      ? oldestLNTx
      : oldestLiquidTX < oldestLNTx
      ? oldestLiquidTX
      : oldestLNTx;

    const [totalLN, totalLiquid] = getTotalSent(
      liquidNodeInformation,
      nodeInformation,
    );

    console.log(oldestPayment);

    setIsCalculatingGains(false);
    setWalletInfo({
      oldestTx: oldestPayment,
      totalSent: totalLN.sent + totalLiquid.sent,
      totalReceived: totalLN.received + totalLiquid.received,
    });
    return;

    // const url = `https://api.coindesk.com/v1/bpi/historical/close.json?start=${oldestTx
    //   .toISOString()
    //   .slice(0, 10)}&end=${new Date().toISOString().slice(0, 10)}`;

    // const response = await fetch(url);
    // const data = await response.json();

    // try {
    //   indexTransactions(data.bpi);
    // } catch (err) {
    //   return null;
    // }
  }

  function getTotalSent(liquidNodeInformation, nodeInformation) {
    let totalLN = {sent: 0, received: 0};
    let totalLiquid = {sent: 0, received: 0};

    nodeInformation.transactions.forEach(tx => {
      totalLN[tx.paymentType] = totalLN[tx.paymentType] + tx.amountMsat / 1000;
    });
    liquidNodeInformation.transactions.forEach(tx => {
      if (tx.type === 'incoming') {
        totalLiquid['received'] =
          totalLiquid['received'] + Math.abs(tx.satoshi[assetIDS['L-BTC']]);
      } else {
        totalLiquid['sent'] =
          totalLiquid['sent'] + Math.abs(tx.satoshi[assetIDS['L-BTC']]);
      }
      // totalLN[tx.paymentType] = totalLN[tx.paymentType] + tx.amountMsat / 1000;
    });
    // const totalReceived = nodeInformation.reduce(
    //   (prev, current) => prev + current.received,
    //   0,
    // );

    console.log(totalLN, 'TESTING', totalLiquid);
    return [totalLN, totalLiquid];
  }
  function indexTransactions(priceData) {
    setProcessStepText('Indexing Transactions');
    const costBasis = nodeInformation.transactions.map(transaction => {
      try {
        const paymentDate = new Date(transaction.paymentTime * 1000)
          .toISOString()
          .split('T')[0];
        const currentDate = new Date(new Date() - 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        const satAmount = transaction.amountMsat / 1000;

        const historicalSatPrice = priceData[paymentDate] / 100000000;
        const currentSatPrice = priceData[currentDate] / 100000000;

        const initialSatValue =
          transaction.paymentType === 'sent'
            ? historicalSatPrice * satAmount * -1
            : historicalSatPrice * satAmount;

        const currentSatValue =
          transaction.paymentType === 'sent'
            ? currentSatPrice * satAmount * -1
            : currentSatPrice * satAmount;

        return {
          gainOnTx:
            isNaN(initialSatValue) || isNaN(currentSatValue)
              ? 0
              : currentSatValue - initialSatValue,
          initalValue: isNaN(initialSatValue) ? 0 : initialSatValue,
          currnetValue: isNaN(currentSatValue) ? 0 : currentSatValue,
          [transaction.paymentType === 'sent' ? 'sent' : 'received']: isNaN(
            satAmount,
          )
            ? 0
            : satAmount,
          [transaction.paymentType != 'sent' ? 'sent' : 'received']: 0,
        };
      } catch (err) {
        console.log(err);
      }
    });

    calculateGains(costBasis);
  }

  function calculateGains(txValueData) {
    setProcessStepText('Calculating Gains');
    const totalGain = txValueData.reduce(
      (prev, current) => prev + current.gainOnTx,
      0,
    );
    const initalValue = txValueData.reduce(
      (prev, current) => prev + current.initalValue,
      0,
    );
    const currentValue = txValueData.reduce(
      (prev, current) => prev + current.currnetValue,
      0,
    );
    const totalSent = txValueData.reduce(
      (prev, current) => prev + current.sent,
      0,
    );
    const totalReceived = txValueData.reduce(
      (prev, current) => prev + current.received,
      0,
    );
    setIsCalculatingGains(false);
    setGainsInfo({
      currentValue: currentValue,
      totalGain: totalGain,
      initialValue: initalValue,
      totalSent: totalSent,
      totalReceived: totalReceived,
    });
  }
}
const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: SIZES.small,
    marginBottom: 10,
  },
  gainsContainer: {
    width: '100%',
    maxWidth: 295,
    height: 'auto',
    padding: 10,
    borderRadius: 8,
    ...SHADOWS.small,
  },
  gainTypeRow: {
    width: '100%',
    marginBottom: 20,
  },
  gainTypeText: {
    fontSize: SIZES.large,
    marginBottom: 10,
  },
  valueText: {
    fontFamily: FONT.Other_Bold,
    textAlign: 'center',
  },
  errorText: {
    width: '95%',
    color: COLORS.cancelRed,
    marginTop: 20,
    textAlign: 'center',
  },
});
