import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {COLORS, SIZES} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {formatBalanceAmount, numberConverter} from '../../../../functions';
import FormattedSatText from '../../../../functions/CustomElements/satTextDisplay';
import {useGlobaleCash} from '../../../../../context-store/eCash';
import {useRef} from 'react';
import handleDBStateChange from '../../../../functions/handleDBStateChange';
import Icon from '../../../../functions/CustomElements/Icon';
import {useNavigation} from '@react-navigation/native';

export function UserSatAmount() {
  const {
    nodeInformation,
    masterInfoObject,
    toggleMasterInfoObject,
    liquidNodeInformation,
    setMasterInfoObject,
    isConnectedToTheInternet,
  } = useGlobalContextProvider();
  const {eCashBalance} = useGlobaleCash();
  const saveTimeoutRef = useRef(null);
  const navigate = useNavigation();

  return (
    <TouchableOpacity
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
          iconHeight={25}
          iconWidth={25}
          styles={styles.valueText}
          formattedBalance={formatBalanceAmount(
            numberConverter(
              (masterInfoObject.liquidWalletSettings.isLightningEnabled
                ? nodeInformation.userBalance
                : 0) +
                liquidNodeInformation.userBalance +
                (masterInfoObject.enabledEcash ? eCashBalance : 0),
              masterInfoObject.userBalanceDenomination,
              nodeInformation,
              masterInfoObject.userBalanceDenomination === 'fiat' ? 2 : 0,
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
          style={styles.pendingBalanceChange}>
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
  balanceContainer: {justifyContent: 'center', marginBottom: 5},
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
  pendingBalanceChange: {position: 'absolute', right: -25},

  valueText: {
    fontSize: SIZES.xxLarge,
    marginHorizontal: 5,
    includeFontPadding: false,
  },
});
