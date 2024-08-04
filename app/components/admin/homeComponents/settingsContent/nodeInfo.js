import {nodeInfo} from '@breeztech/react-native-breez-sdk';
import {useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {CENTER, COLORS, FONT, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {
  copyToClipboard,
  formatBalanceAmount,
  numberConverter,
} from '../../../../functions';
import {useNavigation} from '@react-navigation/native';
import {ThemeText} from '../../../../functions/CustomElements';
import CustomButton from '../../../../functions/CustomElements/button';

export default function NodeInfo() {
  const [lnNodeInfo, setLNNodeInfo] = useState({});
  const [isInfoSet, stIsInfoSet] = useState(false);
  const {theme, masterInfoObject, nodeInformation} = useGlobalContextProvider();
  const navigate = useNavigation();
  const windowDimensions = useWindowDimensions();
  const [seeNodeInfo, setSeeNodeInfo] = useState(false);
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

  if (
    nodeInformation.userBalance === 0 &&
    nodeInformation.inboundLiquidityMsat === 0 &&
    !seeNodeInfo
  ) {
    return (
      <View
        style={[
          {
            flex: 1,
            width: 300,
            alignItems: 'center',
            ...CENTER,
          },
        ]}>
        <ThemeText
          content={'Good to know'}
          styles={{
            ...styles.sectionHeader,
            marginTop: windowDimensions.height / 5.75,
          }}
        />
        <Text style={{textAlign: 'center'}}>
          <ThemeText
            content={`You currently have no lightning channel open on the `}
          />
          <ThemeText styles={{color: COLORS.primary}} content={`mainchain.`} />
        </Text>
        <Text style={{textAlign: 'center', marginTop: 20}}>
          <ThemeText
            content={`Blitz will automatically open a channel to you when you reach a balance of `}
          />
          <ThemeText
            styles={{color: COLORS.primary}}
            content={`1 000 000 sats.`}
          />
        </Text>

        <Text style={{textAlign: 'center', marginTop: 20}}>
          <ThemeText content={`Blitz uses `} />
          <ThemeText
            styles={{color: COLORS.primary}}
            content={`Liquid Network atomic swaps `}
          />
          <ThemeText content={`when you have balance under `} />
          <ThemeText
            styles={{color: COLORS.primary}}
            content={`${formatBalanceAmount(
              numberConverter(
                1000000,
                masterInfoObject.uesrBalanceDenomination,
                nodeInformation,
                masterInfoObject.uesrBalanceDenomination === 'fiat' ? 2 : 0,
              ),
            )} ${
              masterInfoObject.uesrBalanceDenomination === 'fiat'
                ? nodeInformation.fiatStats.coin
                : 'sats'
            } `}
          />
          <ThemeText
            content={`for a smooth onboarding experience and to help users who want to use Lightning Network with smaller amounts.`}
          />
        </Text>
        <CustomButton
          buttonStyles={{width: 'auto', marginTop: 50}}
          textContent={'See node Info'}
          actionFunction={() => setSeeNodeInfo(true)}
        />
      </View>
    );
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
        <ThemeText
          styles={{...styles.peerTitle, color: COLORS.lightModeText}}
          content={'Peer ID'}
        />
        <TouchableOpacity
          onPress={() => {
            copyToClipboard(peer, navigate);
          }}>
          <ThemeText
            styles={{color: COLORS.lightModeText, textAlign: 'center'}}
            content={peer}
          />
        </TouchableOpacity>
      </View>
    );
  });
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View>
        {/* <ThemeText
          styles={{...styles.sectionTitle, marginTop: 20}}
          content={'Lightning'}
        /> */}
        <View
          style={[
            styles.itemContainer,
            {
              backgroundColor: COLORS.darkModeText,
              marginTop: 30,
            },
          ]}>
          <ThemeText styles={{...styles.itemTitle}} content={'Node ID'} />
          <TouchableOpacity
            onPress={() => {
              copyToClipboard(lnNodeInfo?.id, navigate);
            }}>
            <ThemeText
              styles={{
                color: COLORS.lightModeText,
                textAlign: isInfoSet ? 'center' : 'left',
              }}
              content={isInfoSet ? lnNodeInfo?.id : 'N/A'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.itemContainer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 5,
            }}>
            <ThemeText
              styles={{fontSize: SIZES.large}}
              content={`${
                nodeInformation.userBalance > 1000
                  ? `${(nodeInformation.userBalance / 1000).toFixed(0)}k`
                  : nodeInformation.userBalance > 1000000
                  ? `${(nodeInformation.userBalance / 1000000).toFixed(0)}m`
                  : nodeInformation.userBalance
              } ${
                masterInfoObject.userBalanceDenomination === 'fiat'
                  ? nodeInformation.fiatStats.coin
                  : 'sats'
              }`}
            />
            <ThemeText
              styles={{fontSize: SIZES.large}}
              content={`${
                nodeInformation.inboundLiquidityMsat > 1000
                  ? `${(nodeInformation.inboundLiquidityMsat / 1000).toFixed(
                      0,
                    )}k`
                  : nodeInformation.inboundLiquidityMsat > 1000000
                  ? `${(nodeInformation.inboundLiquidityMsat / 1000000).toFixed(
                      0,
                    )}M`
                  : nodeInformation.inboundLiquidityMsat
              } ${
                masterInfoObject.userBalanceDenomination === 'fiat'
                  ? nodeInformation.fiatStats.coin
                  : 'sats'
              }`}
            />
          </View>
          <LiquidityIndicator />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 5,
            }}>
            <ThemeText styles={{fontSize: SIZES.large}} content={'Send'} />
            <ThemeText styles={{fontSize: SIZES.large}} content={'Receive'} />
          </View>
        </View>

        <View
          style={[
            styles.itemContainer,
            {
              backgroundColor: COLORS.darkModeText,
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
        <View
          style={[
            styles.itemContainer,
            {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: COLORS.darkModeText,
              marginTop: 20,
            },
          ]}>
          <ThemeText
            styles={{...styles.itemTitle, marginBottom: 0}}
            content={'On-chain Balance'}
          />
          <ThemeText
            styles={{color: COLORS.lightModeText}}
            content={
              isInfoSet
                ? `${formatBalanceAmount(
                    lnNodeInfo?.onchainBalanceMsat / 1000,
                  )} sats`
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
              backgroundColor: COLORS.darkModeText,
            },
          ]}>
          <ThemeText
            styles={{...styles.itemTitle, marginBottom: 0}}
            content={'Block Height'}
          />
          <ThemeText
            styles={{color: COLORS.lightModeText}}
            content={
              isInfoSet ? formatBalanceAmount(lnNodeInfo?.blockHeight) : 'N/A'
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}

function LiquidityIndicator() {
  const {nodeInformation, theme} = useGlobalContextProvider();
  const [sendWitdh, setsendWitdh] = useState(0);
  const [showLiquidyAmount, setShowLiquidyAmount] = useState(false);
  const windowDimensions = useWindowDimensions();
  const sliderWidth = Math.round(windowDimensions.width * 0.95 * 0.9);

  console.log(sliderWidth);
  useEffect(() => {
    if (nodeInformation.userBalance === 0) {
      setsendWitdh(0);
      return;
    }
    const calculatedWidth = Math.round(
      (nodeInformation.userBalance /
        (nodeInformation.inboundLiquidityMsat / 1000 +
          nodeInformation.userBalance)) *
        sliderWidth,
    );

    setsendWitdh(Number(calculatedWidth));
  }, [nodeInformation]);

  console.log(sendWitdh, 'TEST');

  return (
    <TouchableOpacity
      onPress={() => {
        setShowLiquidyAmount(prev => !prev);
      }}>
      <View style={liquidityStyles.container}>
        <View
          style={[
            liquidityStyles.sliderBar,
            {
              backgroundColor: theme
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}>
          <View
            style={[
              liquidityStyles.sendIndicator,
              {
                width: isNaN(sendWitdh) ? 0 : sendWitdh,
              },
            ]}></View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const liquidityStyles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },

  sliderBar: {
    height: 8,
    width: '100%',

    position: 'relative',

    borderRadius: 8,
    overflow: 'hidden',
  },

  sendIndicator: {
    height: '100%',
    maxWidth: 110,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
});

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.large,
    marginBottom: 10,
  },
  itemContainer: {
    width: '90%',

    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    ...CENTER,
    color: COLORS.lightModeText,
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
    color: COLORS.lightModeText,
  },

  peerTitle: {
    fontFamily: FONT.Title_Regular,
    marginBottom: 5,
  },
  sectionHeader: {
    fontSize: SIZES.large,
    textAlign: 'center',
    marginBottom: 10,
  },
});
