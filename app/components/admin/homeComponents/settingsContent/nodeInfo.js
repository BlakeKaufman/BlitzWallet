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
import * as Clipboard from 'expo-clipboard';
import {useGlobalContextProvider} from '../../../../../context-store/context';

export default function NodeInfo(props) {
  const [lnNodeInfo, setLNNodeInfo] = useState({});
  const [isInfoSet, stIsInfoSet] = useState(false);
  const {theme} = useGlobalContextProvider();

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

  async function copyToClipboard(data) {
    try {
      await Clipboard.setStringAsync(data);
      window.alert('Text Copied to Clipboard');
    } catch (err) {
      window.alert('Error with copy');
      console.log(err);
    }
  }

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
        <Text
          style={[
            styles.peerTitle,
            {
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          Peer ID
        </Text>
        <TouchableOpacity
          onPress={() => {
            copyToClipboard(peer);
          }}>
          <Text
            style={[
              styles.descriptionContent,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            {peer}
          </Text>
        </TouchableOpacity>
      </View>
    );
  });
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            Lightning
          </Text>
          <View
            style={[
              styles.itemContainer,
              {
                backgroundColor: theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
              },
            ]}>
            <Text
              style={[
                styles.itemTitle,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Node ID
            </Text>
            {isInfoSet && (
              <TouchableOpacity
                onPress={() => {
                  copyToClipboard(lnNodeInfo?.id);
                }}>
                <Text
                  style={[
                    styles.descriptionContent,
                    {
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}>
                  {lnNodeInfo?.id}
                </Text>
              </TouchableOpacity>
            )}
            {!isInfoSet && (
              <Text
                style={[
                  styles.descriptionContent,
                  {
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}>
                N/A
              </Text>
            )}
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
              <Text
                style={[
                  styles.itemTitle,
                  {
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}>
                Max Payable
              </Text>
              <Text
                style={[
                  styles.descriptionContent,
                  {
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}>
                {isInfoSet
                  ? (lnNodeInfo?.maxPayableMsat / 1000).toLocaleString()
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.innerHorizontalContainer}>
              <Text
                style={[
                  styles.itemTitle,
                  {
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}>
                Max Receivable
              </Text>
              <Text
                style={[
                  styles.descriptionContent,
                  {
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}>
                {isInfoSet
                  ? (lnNodeInfo?.inboundLiquidityMsats / 1000).toLocaleString()
                  : 'N/A'}
              </Text>
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
            <Text
              style={[
                styles.itemTitle,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Connected Peers
            </Text>
            {isInfoSet && (
              <ScrollView style={{height: 120}}>
                {connectedPeersElements}
              </ScrollView>
            )}
            {!isInfoSet && (
              <Text
                style={[
                  styles.descriptionContent,
                  {
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}>
                N/A
              </Text>
            )}
          </View>
        </View>
        {/* Bitcoin */}
        <View>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            Bitcoin
          </Text>
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
            <Text
              style={[
                styles.itemTitle,
                {
                  width: 'auto',
                  marginBottom: 0,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              On-chain Balance
            </Text>
            <Text
              style={[
                styles.descriptionContent,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              {isInfoSet
                ? (lnNodeInfo?.onchainBalanceMsat / 1000).toLocaleString()
                : 'N/A'}
            </Text>
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
            <Text
              style={[
                styles.itemTitle,
                {
                  width: 'auto',
                  marginBottom: 0,
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              Block Height
            </Text>
            <Text
              style={[
                styles.descriptionContent,
                {
                  color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                },
              ]}>
              {isInfoSet ? lnNodeInfo?.blockHeight?.toLocaleString() : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  innerContainer: {
    width: '90%',
    flex: 1,
    paddingTop: 10,
  },

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
    // ...SHADOWS.small,
  },
  horizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  innerHorizontalContainer: {
    alignItems: 'center',
  },
  itemTitle: {
    width: '100%',
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    marginBottom: 10,
  },
  descriptionContent: {
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
  },

  peerTitle: {
    fontFamily: FONT.Other_Bold,
    fontSize: SIZES.medium,
    marginBottom: 5,
  },
});
