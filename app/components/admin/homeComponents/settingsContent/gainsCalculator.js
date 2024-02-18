import {useEffect, useState} from 'react';
import {StyleSheet, View, Text, ActivityIndicator} from 'react-native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {CENTER, COLORS, FONT, SHADOWS, SIZES} from '../../../../constants';

export default function GainsCalculator() {
  const [isCalculatingGains, setIsCalculatingGains] = useState(true);
  const [processStepText, setProcessStepText] = useState('');
  const {nodeInformation, theme} = useGlobalContextProvider();
  const [gainsInfo, setGainsInfo] = useState({
    totalGain: 0,
    initialValue: 0,
    currentValue: 0,
    totalSent: 0,
    totalReceived: 0,
  });

  useEffect(() => {
    initGainsCalculator(nodeInformation);
  }, []);

  return (
    <View style={styles.globalContainer}>
      {isCalculatingGains ? (
        <View style={styles.innerContainer}>
          <ActivityIndicator
            size="large"
            color={theme ? COLORS.darkModeText : COLORS.lightModeText}
          />
          <Text style={styles.processStepText}>{processStepText}</Text>
        </View>
      ) : (
        <View style={styles.innerContainer}>
          <Text
            style={[
              styles.dateText,
              {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
            ]}>
            Price info through:{' '}
            {new Date(new Date() - 24 * 60 * 60 * 1000).toLocaleDateString()}
          </Text>
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
              <Text
                style={[
                  styles.gainTypeText,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                Profit/Loss
              </Text>
              <Text
                style={[
                  styles.valueText,
                  {color: gainsInfo.totalGain > 0 ? 'green' : 'red'},
                ]}>
                ${gainsInfo.totalGain.toLocaleString()}
              </Text>
            </View>
            <View style={styles.gainTypeRow}>
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
            </View>
            <View style={[styles.gainTypeRow]}>
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
            </View>
            <View style={[styles.gainTypeRow]}>
              <Text
                style={[
                  styles.gainTypeText,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                Total Sent
              </Text>
              <Text
                style={[
                  styles.valueText,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                {gainsInfo.totalSent.toLocaleString()} sats
              </Text>
            </View>
            <View style={[styles.gainTypeRow, {marginBottom: 0}]}>
              <Text
                style={[
                  styles.gainTypeText,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                Total Received
              </Text>
              <Text
                style={[
                  styles.valueText,
                  {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                ]}>
                {gainsInfo.totalReceived.toLocaleString()} sats
              </Text>
            </View>
          </View>
          <Text style={styles.errorText}>
            Becuase of the API we use to get the price data, these values are in
            USD.
          </Text>
        </View>
      )}
    </View>
  );

  async function initGainsCalculator(nodeInformation) {
    setProcessStepText('Getting Historical Price');
    const oldestTx = new Date(
      nodeInformation.transactions[nodeInformation.transactions.length - 1]
        .paymentTime * 1000,
    );

    const url = `https://api.coindesk.com/v1/bpi/historical/close.json?start=${oldestTx
      .toISOString()
      .slice(0, 10)}&end=${new Date().toISOString().slice(0, 10)}`;

    const response = await fetch(url);
    const data = await response.json();

    try {
      indexTransactions(data.bpi);
    } catch (err) {
      return null;
    }
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
  globalContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processStepText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    marginTop: 20,
  },
  dateText: {
    fontSize: SIZES.small,
    fontFamily: FONT.Title_Regular,
    marginBottom: 10,
  },
  gainsContainer: {
    width: '95%',
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
    fontFamily: FONT.Title_Regular,
    marginBottom: 10,
  },
  valueText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Other_Bold,
    textAlign: 'center',
  },
  errorText: {
    width: '95%',
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.medium,
    color: COLORS.cancelRed,
    marginTop: 20,
    textAlign: 'center',
  },
});
