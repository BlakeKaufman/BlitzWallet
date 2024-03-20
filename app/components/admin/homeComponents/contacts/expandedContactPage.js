import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SATSPERBITCOIN,
  SIZES,
} from '../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {formatBalanceAmount} from '../../../../functions';
import {useEffect, useRef, useState} from 'react';

export default function ExpandedContactsPage(props) {
  const navigate = useNavigation();
  const {
    theme,
    nostrSocket,
    nostrEvents,
    toggleNostrEvents,
    nostrContacts,
    toggleNostrContacts,
    userBalanceDenomination,
    nodeInformation,
  } = useGlobalContextProvider();
  const selectedNpub = props.route.params.npub;
  //   const [contactsList, setContactsList] = useState(props.route.params.contacts);
  const [selectedContact] = nostrContacts?.filter(
    contact => contact.npub === selectedNpub,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [transactionHistory, setTransactionHistory] = useState([]);

  useEffect(() => {
    setIsLoading(true);

    let storedTransactions = selectedContact.transactions || [];

    if (selectedContact.unlookedTransactions.length != 0) {
      const unlookedStoredTransactions =
        selectedContact.unlookedTransactions || [];
      storedTransactions = [
        ...new Set([...storedTransactions, ...unlookedStoredTransactions]),
      ];
      toggleNostrContacts(
        {
          transactions: storedTransactions,
          unlookedTransactions: [],
        },
        null,
        selectedContact,
      );
    }

    const formattedTx =
      selectedContact.transactions.length === 0
        ? []
        : selectedContact.transactions
            .filter(tx => tx)
            .sort((a, b) => {
              if (a?.time && b?.time) {
                return b.time - a.time;
              }
              // If time property is missing, retain the original order
              return 0;
            })
            .map((transaction, id) => {
              return (
                <TransactionItem
                  nodeInformation={nodeInformation}
                  userBalanceDenomination={userBalanceDenomination}
                  theme={theme}
                  transaction={transaction}
                  id={id}
                />
              );
            });

    setTransactionHistory(formattedTx);

    setIsLoading(false);
  }, [nostrContacts]);

  const themeBackground = theme
    ? COLORS.darkModeBackground
    : COLORS.lightModeBackground;
  const themeText = theme ? COLORS.darkModeText : COLORS.lightModeText;
  const themeBackgroundOffset = theme
    ? COLORS.darkModeBackgroundOffset
    : COLORS.lightModeBackgroundOffset;

  return (
    <View
      style={[
        styles.globalContainer,
        {
          backgroundColor: themeBackground,
        },
      ]}>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              navigate.goBack();
            }}>
            <Image
              style={{
                width: 30,
                height: 30,
                transform: [{translateX: -7}],
              }}
              source={ICONS.smallArrowLeft}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              (async () => {
                const didSet = await toggleNostrContacts(
                  {isFavorite: !selectedContact.isFavorite},
                  null,
                  selectedContact,
                );
              })();
            }}>
            <Image
              style={styles.backButton}
              source={
                selectedContact.isFavorite
                  ? ICONS.starBlue
                  : theme
                  ? ICONS.starWhite
                  : ICONS.starBlack
              }
            />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.profileImage,
            {
              borderColor: themeBackgroundOffset,
              backgroundColor: themeText,
            },
          ]}>
          <Image
            source={
              selectedContact.profileImg
                ? selectedContact.profileImg
                : ICONS.userIcon
            }
            style={{width: '80%', height: '80%'}}
          />
        </View>
        <Text style={[styles.profileName, {color: themeText}]}>
          {selectedContact.name}
        </Text>

        <View style={styles.buttonGlobalContainer}>
          <TouchableOpacity
            onPress={() => {
              navigate.navigate('SendAndRequestPage', {
                selectedContact: selectedContact,
                paymentType: 'send',
              });
            }}
            style={[styles.buttonContainer, {backgroundColor: themeText}]}>
            <Text style={[styles.buttonText, {color: themeBackground}]}>
              Send
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonContainer, {backgroundColor: themeText}]}>
            <Text style={[styles.buttonText, {color: themeBackground}]}>
              Request
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={{flex: 1, alignItems: 'center'}}>
            <ActivityIndicator
              size="large"
              color={theme ? COLORS.darkModeText : COLORS.lightModeText}
            />
          </View>
        ) : transactionHistory.length != 0 ? (
          <ScrollView
            style={{
              flex: 1,
              maxHeight: 400,
              width: '80%',
              ...CENTER,
              marginBottom: 10,
            }}>
            {transactionHistory}
          </ScrollView>
        ) : (
          <View style={{flex: 1, alignItems: 'center'}}>
            <Text style={[styles.buttonText, {color: themeText}]}>
              No Transactions
            </Text>
          </View>
        )}

        <View style={{width: '100%', alignItems: 'center'}}>
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.nostrGreen,
              borderRadius: 8,
              overflow: 'hidden',
              marginBottom: 5,
            }}>
            <Image
              style={{
                width: 20,
                height: 20,
                margin: 12,
              }}
              source={ICONS.paperApirplane}
            />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: FONT.Title_Regular,
              fontSize: SIZES.small,
              color: themeText,
            }}>
            Share contact
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

function TransactionItem(props) {
  const endDate = new Date();
  const startDate = new Date(props.transaction.time * 1000);
  const paymentDate = new Date(props.transaction.time * 1000).toLocaleString();
  const timeDifferenceMs = endDate - startDate;
  const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
  const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60);
  const timeDifferenceDays = timeDifferenceMs / (1000 * 60 * 60 * 24);

  const txParsed = isJSON(props.transaction.content)
    ? JSON.parse(props.transaction.content)
    : props.transaction.content;

  const paymentDescription = !Object.keys(txParsed).includes('amountMsat')
    ? txParsed || 'Unknown'
    : txParsed.description || 'Unknown';

  return (
    <TouchableOpacity
      key={props.id}
      activeOpacity={0.5}
      onPress={() => {
        // props.navigate.navigate('ExpandedTx', {
        //   txId: props.details.data.paymentHash,
        // });
      }}>
      <View style={styles.transactionContainer}>
        <Image
          source={ICONS.smallArrowLeft}
          style={[
            styles.icons,
            {
              transform: [
                {
                  rotate: props.transaction.wasSent ? '130deg' : '310deg',
                },
              ],
            },
          ]}
          resizeMode="contain"
        />

        <View>
          <Text
            style={[
              styles.descriptionText,
              {
                color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            {paymentDescription.length > 15
              ? paymentDescription.slice(0, 15) + '...'
              : paymentDescription}
          </Text>

          <Text
            style={[
              styles.dateText,
              {
                color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            {timeDifferenceMinutes < 60
              ? timeDifferenceMinutes < 1
                ? ''
                : Math.round(timeDifferenceMinutes)
              : Math.round(timeDifferenceHours) < 24
              ? Math.round(timeDifferenceHours)
              : Math.round(timeDifferenceDays)}{' '}
            {`${
              Math.round(timeDifferenceMinutes) < 60
                ? timeDifferenceMinutes < 1
                  ? 'Just now'
                  : Math.round(timeDifferenceMinutes) === 1
                  ? 'minute'
                  : 'minutes'
                : Math.round(timeDifferenceHours) < 24
                ? Math.round(timeDifferenceHours) === 1
                  ? 'hour'
                  : 'hours'
                : Math.round(timeDifferenceDays) === 1
                ? 'day'
                : 'days'
            } ${timeDifferenceMinutes > 1 ? 'ago' : ''}`}
          </Text>
        </View>
        <Text
          style={[
            styles.amountText,
            {
              color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          {Object.keys(txParsed).includes('amountMsat') &&
          props.userBalanceDenomination != 'hidden'
            ? (props.transaction.wasSent ? '-' : '+') +
              formatBalanceAmount(
                props.userBalanceDenomination === 'sats'
                  ? txParsed.amountMsat / 1000
                  : (
                      (txParsed.amountMsat / 1000) *
                      (props.nodeInformation.fiatStats.value / SATSPERBITCOIN)
                    ).toFixed(2),
              ) +
              ` ${
                props.userBalanceDenomination === 'hidden'
                  ? ''
                  : props.userBalanceDenomination === 'sats'
                  ? 'sats'
                  : props.nodeInformation.fiatStats.coin
              }`
            : ' *****'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function isJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}
const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },
  topBar: {
    width: '95%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
    // backgroundColor: 'black',
    ...CENTER,
  },
  backButton: {
    width: 20,
    height: 20,
  },

  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 125,
    borderWidth: 5,
    backgroundColor: 'red',
    ...CENTER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  profileName: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    fontWeight: 'bold',
    ...CENTER,
  },
  buttonGlobalContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 25,
  },

  buttonContainer: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },

  gradient: {
    height: 100,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },

  transactionContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12.5,
  },
  icons: {
    width: 30,
    height: 30,
    marginRight: 15,
  },

  descriptionText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Descriptoin_Regular,
  },
  dateText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.small,
  },
  amountText: {
    marginLeft: 'auto',
    fontFamily: FONT.Other_Regular,
    fontSize: SIZES.medium,
  },
  transactionTimeBanner: {
    width: '100%',
    alignItems: 'center',

    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.medium,

    padding: 5,
    borderRadius: 2,
    overflow: 'hidden',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    width: '85%',
    alignItems: 'center',
  },
  noTransactionsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noTransactionsText: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONT.Descriptoin_Regular,
  },

  mostRecentTxContainer: {
    width: 'auto',
    ...CENTER,
    alignItems: 'center',
  },
});
