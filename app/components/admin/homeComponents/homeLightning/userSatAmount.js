import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {COLORS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';
import {useGlobaleCash} from '../../../../../context-store/eCash';
import {useRef, useState} from 'react';
import handleDBStateChange from '../../../../functions/handleDBStateChange';
import Icon from '../../../../functions/CustomElements/Icon';
import {useNavigation} from '@react-navigation/native';
import {useNodeContext} from '../../../../../context-store/nodeContext';

export function UserSatAmount() {
  const {
    masterInfoObject,
    toggleMasterInfoObject,
    setMasterInfoObject,
    isConnectedToTheInternet,
  } = useGlobalContextProvider();
  const {nodeInformation, liquidNodeInformation} = useNodeContext();
  const {eCashBalance} = useGlobaleCash();
  const saveTimeoutRef = useRef(null);
  const navigate = useNavigation();
  const [balanceWidth, setBalanceWidth] = useState(0);

  const userBalance =
    (masterInfoObject.liquidWalletSettings.isLightningEnabled
      ? nodeInformation.userBalance
      : 0) +
    liquidNodeInformation.userBalance +
    (masterInfoObject.enabledEcash ? eCashBalance : 0);

  return (
    <TouchableOpacity
      onLayout={event => {
        const {width} = event.nativeEvent.layout;
        setBalanceWidth(width);
      }}
      style={styles.balanceContainer}
      onPress={() => {
        if (!isConnectedToTheInternet) {
          navigate.navigate('ErrorScreen', {
            errorMessage:
              'Please reconnect to the internet to switch your denomination',
          });
          return;
        }
        if (masterInfoObject.userBalanceDenomination === 'sats')
          handleDBStateChange(
            {userBalanceDenomination: 'fiat'},
            setMasterInfoObject,
            toggleMasterInfoObject,
            saveTimeoutRef,
          );
        else if (masterInfoObject.userBalanceDenomination === 'fiat')
          handleDBStateChange(
            {userBalanceDenomination: 'hidden'},
            setMasterInfoObject,
            toggleMasterInfoObject,
            saveTimeoutRef,
          );
        else
          handleDBStateChange(
            {userBalanceDenomination: 'sats'},
            setMasterInfoObject,
            toggleMasterInfoObject,
            saveTimeoutRef,
          );
      }}>
      <View style={styles.valueContainer}>
        <FormattedSatText
          styles={styles.valueText}
          formattedBalance={formatBalanceAmount(
            numberConverter(
              userBalance,
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
              !userBalance || masterInfoObject.userBalanceDenomination != 'fiat'
                ? 0
                : 2,
            ),
          )}
        />
      </View>
      {(!!liquidNodeInformation.pendingReceive ||
        !!liquidNodeInformation.pendingSend) && (
        <TouchableOpacity
          onPress={() => {
            navigate.navigate('InformationPopup', {
              CustomTextComponent: () => {
                return (
                  <FormattedSatText
                    containerStyles={styles.informationPopupContainer}
                    styles={{
                      color: COLORS.lightModeText,
                    }}
                    frontText={'You have '}
                    formattedBalance={formatBalanceAmount(
                      numberConverter(
                        liquidNodeInformation.pendingReceive -
                          liquidNodeInformation.pendingSend,
                        masterInfoObject.userBalanceDenomination,
                        nodeInformation,
                        masterInfoObject.userBalanceDenomination === 'fiat'
                          ? 2
                          : 0,
                      ),
                    )}
                    backText={' waiting to confirm'}
                  />
                );
              },
              buttonText: 'I understand',
            });
          }}
          style={{...styles.pendingBalanceChange, left: balanceWidth + 5}}>
          <Icon
            color={COLORS.primary}
            width={25}
            height={25}
            name={'pendingTxIcon'}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  balanceContainer: {
    justifyContent: 'center',
    marginBottom: 5,
    position: 'relative',
  },
  valueContainer: {
    width: '95%',
    maxWidth: 280,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  informationPopupContainer: {
    width: '100%',
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  pendingBalanceChange: {position: 'absolute'},

  valueText: {
    fontSize: SIZES.xxLarge,
    includeFontPadding: false,
  },
});
