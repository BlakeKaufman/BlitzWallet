import {StyleSheet, View} from 'react-native';
import {CENTER, COLORS, SIZES} from '../../../../../constants';
import {useGlobalThemeContext} from '../../../../../../context-store/theme';
import {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  formatEcashTx,
  migrateEcashWallet,
} from '../../../../../functions/eCash/wallet';
import GetThemeColors from '../../../../../hooks/themeColors';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';
import {useGlobaleCash} from '../../../../../../context-store/eCash';
import {
  addMint,
  selectMint,
  storeEcashTransactions,
  storeProofs,
} from '../../../../../functions/eCash/db';
import CustomButton from '../../../../../functions/CustomElements/button';

export default function MigrateProofsPopup(props) {
  const navigate = useNavigation();
  const {theme, darkModeType} = useGlobalThemeContext();
  const {backgroundColor, backgroundOffset} = GetThemeColors();
  const {parsedEcashInformation, toggleGLobalEcashInformation} =
    useGlobaleCash();
  const [wasSuccessfull, setWasSuccesfull] = useState(false);

  useEffect(() => {
    if (!parsedEcashInformation) return;
    async function handleMigration() {
      let success = true;

      try {
        for (const mint of parsedEcashInformation) {
          runCount += 1;
          const wallet = await migrateEcashWallet(mint.mintURL);
          if (!wallet) {
            navigate.goBack();
            setTimeout(() => {
              navigate.navigate('ErrorScreen', {
                errorMessage: 'Unable to create temporary signing wallet',
              });
            }, 250);
            success = false;
            break;
          }

          const didAdd = await addMint(mint.mintURL);
          if (!didAdd) {
            navigate.goBack();
            setTimeout(() => {
              navigate.navigate('ErrorScreen', {
                errorMessage: 'Unable to add selected mint',
              });
            }, 250);
            success = false;
            break;
          }
          if (mint.isCurrentMint) {
            const didSelect = await selectMint(mint.mintURL);
            if (!didSelect) {
              navigate.goBack();
              setTimeout(() => {
                navigate.navigate('ErrorScreen', {
                  errorMessage: 'Unable to add selected mint',
                });
              }, 250);
              success = false;
              break;
            }
          }
          if (mint.proofs?.length) {
            console.log(mint.proofs, 'MING PROOFS');
            const proofStates = await wallet.checkProofsStates(mint.proofs);
            const unspentProofs = mint.proofs.filter(
              (proof, index) => proofStates[index].state === 'UNSPENT',
            );
            console.log(proofStates, unspentProofs);
            if (unspentProofs.length > 0) {
              const didStore = await storeProofs(unspentProofs, mint.mintURL);
              if (!didStore) {
                navigate.goBack();
                setTimeout(() => {
                  navigate.navigate('ErrorScreen', {
                    errorMessage: 'Unable to save proofs',
                  });
                }, 250);
                success = false;
                break;
              }
            }
          }
          if (mint.transactions?.length) {
            let formattedTransactions = [];
            for (const tx of mint.transactions) {
              const formattedEcashTx = formatEcashTx({
                time: tx.time,
                amount: tx.amount,
                fee: tx.fee,
                paymentType: tx.paymentType,
              });
              formattedTransactions.push(formattedEcashTx);
            }

            const didStore = await storeEcashTransactions(
              formattedTransactions,
              mint.mintURL,
            );
            if (!didStore) {
              navigate.goBack();
              setTimeout(() => {
                navigate.navigate('ErrorScreen', {
                  errorMessage: 'Unable to save transactions',
                });
              }, 250);
              success = false;
              break;
            }
          }
        }
        if (!success) return;

        toggleGLobalEcashInformation(null, true);
        setWasSuccesfull(true);
      } catch (err) {
        console.log('ecash migration error', err);
        navigate.goBack();
        setTimeout(() => {
          navigate.navigate('ErrorScreen', {
            errorMessage: String(err),
          });
        }, 250);
      }
    }
    handleMigration();
  }, [parsedEcashInformation]);
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.content,
          {
            height: 200,
            backgroundColor:
              theme && darkModeType ? backgroundOffset : backgroundColor,
            padding: 10,
          },
        ]}>
        <FullLoadingScreen
          containerStyles={{width: '95%', ...CENTER}}
          textStyles={{textAlign: 'center'}}
          showLoadingIcon={!wasSuccessfull}
          text={wasSuccessfull ? 'Migration complete' : 'Migration in progress'}
        />
        {wasSuccessfull && (
          <CustomButton
            actionFunction={() => navigate.goBack()}
            textContent={'Go back'}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.halfModalBackgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 15,
  },
  button: {
    width: '50%',
    height: 30,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: SIZES.large,
  },

  content: {
    width: '95%',
    maxWidth: 300,
    borderRadius: 8,
  },
  headerText: {
    width: '90%',
    paddingVertical: 15,
    textAlign: 'center',
    ...CENTER,
  },
  border: {
    height: '100%',
    width: 1,
  },
});
