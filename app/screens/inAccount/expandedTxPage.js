import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {BTN, COLORS, FONT, ICONS, SIZES} from '../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../context-store/context';
const SATPERBITCOINCONSTANT = 100000000;

export default function ExpandedTx(props) {
  console.log('Transaction Detials Page');
  const navigate = useNavigation();
  const {theme, nodeInformation} = useGlobalContextProvider();

  const [selectedTX] = nodeInformation.transactions?.filter(tx => {
    return props.route.params.txId === tx.details.data.paymentHash;
  });

  console.log(selectedTX);
  const paymentDate = new Date(selectedTX.paymentTime * 1000);
  const month = paymentDate.toLocaleString('default', {month: 'short'});
  const day = paymentDate.getDate();
  const year = paymentDate.getFullYear();
  console.log(paymentDate);

  console.log(
    (
      (nodeInformation.fiatStats.value / SATPERBITCOINCONSTANT) *
      (selectedTX.feeMsat / 1000)
    ).toFixed(3),
  );

  return (
    <View
      style={[
        styles.popupContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
          padding: 10,
        },
      ]}>
      <SafeAreaView style={{flex: 1}}>
        <TouchableOpacity
          onPress={() => {
            navigate.goBack();
          }}>
          <Image style={styles.backButton} source={ICONS.smallArrowLeft} />
        </TouchableOpacity>
        <View style={styles.innerContainer}>
          <Text
            style={[
              styles.headerText,
              {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
            ]}>
            Status
          </Text>
          <Text
            style={[
              styles.didCompleteText,
              {
                color:
                  selectedTX.status === 'complete'
                    ? 'green'
                    : theme
                    ? COLORS.darkModeText
                    : COLORS.lightModeText,
              },
            ]}>
            {selectedTX.status === 'complete' ? 'Successful' : 'Payment Failed'}
          </Text>

          <Text
            style={[
              styles.fiatHeaderAmount,
              {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
            ]}>{`${selectedTX.paymentType === 'sent' ? '-' : '+'}${(
            (nodeInformation.fiatStats.value / SATPERBITCOINCONSTANT) *
            (selectedTX.amountMsat / 1000)
          ).toFixed(2)} ${nodeInformation.fiatStats.coin}`}</Text>
          <Text
            style={[
              styles.satHeaderAmount,
              {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
            ]}>{`${(
            selectedTX.amountMsat / 1000
          ).toLocaleString()} SATS`}</Text>

          <View
            style={[
              styles.infoContainer,
              {
                borderColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            <View style={[styles.infoRow, {marginBottom: 20}]}>
              <View style={styles.contentBlock}>
                <Text
                  style={[
                    styles.infoHeaders,
                    {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                  ]}>
                  Date
                </Text>
                <Text
                  style={[
                    styles.infoDescriptions,
                    {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                  ]}>{`${month} ${day}, ${year}`}</Text>
              </View>
              <View style={styles.contentBlock}>
                <Text
                  style={[
                    styles.infoHeaders,
                    {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                  ]}>
                  Time
                </Text>
                <Text
                  style={[
                    styles.infoDescriptions,
                    {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                  ]}>{`${
                  paymentDate.getHours() <= 9
                    ? '0' + paymentDate.getHours()
                    : paymentDate.getHours()
                }:${
                  paymentDate.getMinutes() <= 9
                    ? '0' + paymentDate.getMinutes()
                    : paymentDate.getMinutes()
                }`}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.contentBlock}>
                <Text
                  style={[
                    styles.infoHeaders,
                    {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                  ]}>
                  Fee
                </Text>
                <Text
                  style={[
                    styles.infoDescriptions,
                    {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                  ]}>{`$${(
                  (nodeInformation.fiatStats.value / SATPERBITCOINCONSTANT) *
                  (selectedTX.feeMsat / 1000)
                ).toFixed(3)}`}</Text>
              </View>
              <View style={styles.contentBlock}>
                <Text
                  style={[
                    styles.infoHeaders,
                    {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                  ]}>
                  Type
                </Text>
                <Text
                  style={[
                    styles.infoDescriptions,
                    {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                  ]}>{`Lightning`}</Text>
              </View>
            </View>
          </View>
          {selectedTX.status != 'complete' && (
            <Text
              style={[
                styles.failedTransactionText,
                {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
              ]}>
              No money has been sent
            </Text>
          )}
          <View style={styles.descriptionContainer}>
            <Text
              style={[
                styles.descriptionHeader,
                {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
              ]}>
              Description
            </Text>
            <View
              style={[
                styles.descriptionContentContainer,
                {
                  backgroundColor: theme
                    ? COLORS.darkModeBackgroundOffset
                    : COLORS.lightModeBackgroundOffset,
                },
              ]}>
              <ScrollView
                horizontal={false}
                showsVerticalScrollIndicator={false}>
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}>
                  {selectedTX.description
                    ? selectedTX.description
                    : 'No description'}
                </Text>
              </ScrollView>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              navigate.navigate('TechnicalTransactionDetails', {
                selectedTX: selectedTX,
              });
            }}
            style={[
              styles.buttonContainer,
              {borderColor: theme ? COLORS.darkModeText : COLORS.lightModeText},
            ]}>
            <Text
              style={[
                styles.buttonText,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Technical details
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  popupContainer: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
  },

  innerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: SIZES.xxLarge,
    fontFamily: FONT.Title_Regular,
  },
  didCompleteText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Descriptoin_Regular,
    marginBottom: 30,
  },

  fiatHeaderAmount: {
    fontSize: SIZES.xxLarge,
    fontFamily: FONT.Title_Regular,
  },
  satHeaderAmount: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    marginBottom: 20,
  },

  infoContainer: {
    width: '95%',
    maxWidth: 300,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentBlock: {
    width: '45%',
    alignContent: 'center',
    justifyContent: 'center',
  },
  infoHeaders: {
    textAlign: 'center',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
    marginBottom: 5,
  },
  infoDescriptions: {
    textAlign: 'center',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.small,
  },
  failedTransactionText: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.large,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  descriptionContainer: {
    width: '95%',
    maxWidth: 300,
  },
  descriptionHeader: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    marginBottom: 10,
  },
  descriptionContentContainer: {
    width: '100%',
    height: 100,
    padding: 10,
    borderRadius: 8,
  },
  buttonContainer: {
    marginTop: 'auto',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  buttonText: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
  },
});
