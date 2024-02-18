import {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {getLocalStorageItem} from '../../../../functions';
import TermsPage from './ecashComponents/termsPage';

export default function EcashHome() {
  const [acceptedEcashTerms, setAcceptedEcashTerms] = useState(null);
  const {theme} = useGlobalContextProvider();

  console.log(acceptedEcashTerms);

  useEffect(() => {
    initScreen();
  }, []);

  return (
    <View style={styles.globalContainer}>
      <SafeAreaView style={styles.globalContainer}>
        {acceptedEcashTerms ? (
          <Text style={{color: 'black'}}>Testing</Text>
        ) : (
          <TermsPage />
        )}
      </SafeAreaView>
    </View>
  );

  async function initScreen() {
    setAcceptedEcashTerms(JSON.parse(await getLocalStorageItem('ecashTerms')));
  }
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
  },

  termsContentContainer: {
    flex: 1,
  },
});
