import {nodeInfo} from '@breeztech/react-native-breez-sdk';
import {useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {COLORS, FONT, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {
  copyToClipboard,
  formatBalanceAmount,
  numberConverter,
} from '../../../../functions';
import {useNavigation} from '@react-navigation/native';
import {ThemeText} from '../../../../functions/CustomElements';

export default function NodeInfo() {
  const [lnNodeInfo, setLNNodeInfo] = useState({});
  const [isInfoSet, stIsInfoSet] = useState(false);
  const {theme, masterInfoObject, nodeInformation} = useGlobalContextProvider();
  const navigate = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        const nodeState = await nodeInfo();
        setLNNodeInfo(nodeState);
        stIsInfoSet(true);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  const connectedPeersElements = lnNodeInfo?.connectedPeers?.map((peer, id) => {
    return (
      <View
        key={id}
        style={{
          borderBottomWidth:
            id === lnNodeInfo?.connectedPeers.length - 1 ? 0 : 2,
          marginBottom: id === lnNodeInfo?.connectedPeers.length - 1 ? 0 : 10,
          paddingBottom: id === lnNodeInfo?.connectedPeers.length - 1 ? 0 : 10,
        }}>
        <ThemeText styles={{...styles.peerTitle}} content={'Peer ID'} />
        <TouchableOpacity
          onPress={() => {
            copyToClipboard(peer, navigate);
          }}>
          <ThemeText content={peer} />
        </TouchableOpacity>
      </View>
    );
  });
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View>
        <ThemeText
          styles={{...styles.sectionTitle, marginTop: 20}}
          content={'Lightning'}
        />
        <View
          style={[
            styles.itemContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
            },
          ]}>
          <ThemeText styles={{...styles.itemTitle}} content={'Node ID'} />
          <TouchableOpacity
            onPress={() => {
              copyToClipboard(lnNodeInfo?.id, navigate);
            }}>
            <ThemeText content={isInfoSet ? lnNodeInfo?.id : 'N/A'} />
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.itemContainer,
            styles.horizontalContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
            },
          ]}>
          <View style={styles.innerHorizontalContainer}>
            <ThemeText styles={{...styles.itemTitle}} content={'Max Payable'} />

            <ThemeText
              content={`${
                isInfoSet
                  ? formatBalanceAmount(
                      numberConverter(
                        lnNodeInfo?.maxPayableMsat / 1000,
                        masterInfoObject.userBalanceDenomination,
                        nodeInformation,
                        masterInfoObject.userBalanceDenomination != 'fiat'
                          ? 0
                          : 2,
                      ),
                    )
                  : 'N/A'
              } ${
                masterInfoObject.userBalanceDenomination != 'fiat'
                  ? 'sats'
                  : nodeInformation.fiatStats.coin
              }`}
            />
          </View>
          <View style={styles.innerHorizontalContainer}>
            <ThemeText
              styles={{...styles.itemTitle}}
              content={'Max Receivable'}
            />

            <ThemeText
              content={`${
                isInfoSet
                  ? formatBalanceAmount(
                      numberConverter(
                        lnNodeInfo?.inboundLiquidityMsats / 1000,
                        masterInfoObject.userBalanceDenomination,
                        nodeInformation,
                        masterInfoObject.userBalanceDenomination != 'fiat'
                          ? 0
                          : 2,
                      ),
                    )
                  : 'N/A'
              } ${
                masterInfoObject.userBalanceDenomination != 'fiat'
                  ? 'sats'
                  : nodeInformation.fiatStats.coin
              }`}
            />
          </View>
        </View>
        <View
          style={[
            styles.itemContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
            },
          ]}>
          <ThemeText
            styles={{...styles.itemTitle}}
            content={'Connected Peers'}
          />

          <ScrollView style={{height: 120}}>
            {isInfoSet ? connectedPeersElements : <ThemeText content={'N/A'} />}
          </ScrollView>
        </View>
      </View>
      {/* Bitcoin */}
      <View>
        <ThemeText styles={{...styles.sectionTitle}} content={'Bitcoin'} />
        <View
          style={[
            styles.itemContainer,
            {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
            },
          ]}>
          <ThemeText
            styles={{...styles.itemTitle, marginBottom: 0}}
            content={'On-chain Balance'}
          />
          <ThemeText
            content={
              isInfoSet
                ? formatBalanceAmount(lnNodeInfo?.onchainBalanceMsat / 1000)
                : 'N/A'
            }
          />
        </View>
        <View
          style={[
            styles.itemContainer,
            {
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
            },
          ]}>
          <ThemeText
            styles={{...styles.itemTitle, marginBottom: 0}}
            content={'Block Height'}
          />
          <ThemeText
            content={
              isInfoSet ? formatBalanceAmount(lnNodeInfo?.blockHeight) : 'N/A'
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.large,
    marginBottom: 10,
  },
  itemContainer: {
    backgroundColor: COLORS.offsetBackground,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  horizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  innerHorizontalContainer: {
    alignItems: 'center',
  },
  itemTitle: {
    marginBottom: 10,
  },

  peerTitle: {
    fontFamily: FONT.Other_Bold,
    marginBottom: 5,
  },
});
