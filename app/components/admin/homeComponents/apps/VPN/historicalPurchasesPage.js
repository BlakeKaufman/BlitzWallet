import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {
  GlobalThemeView,
  ThemeText,
} from '../../../../../functions/CustomElements';
import {SIZES, WINDOWWIDTH} from '../../../../../constants/theme';
import {CENTER, ICONS} from '../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {backArrow} from '../../../../../constants/styles';
import {useEffect, useState} from 'react';
import {getLocalStorageItem} from '../../../../../functions';

export default function HistoricalVPNPurchases() {
  const [purchaseList, setPurchaseList] = useState([]);
  const navigate = useNavigation();

  useEffect(() => {
    async function getSavedPurchases() {
      const savedRequests =
        JSON.parse(await getLocalStorageItem('savedVPNIds')) || [];
      setPurchaseList(savedRequests);
    }
    getSavedPurchases();
  }, []);

  const purchaseElements = purchaseList.map((item, index) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (item.generatedFile)
            navigate.navigate('GeneratedVPNFile', {
              generatedFile: item.generatedFile,
            });
        }}>
        <ThemeText content={'tst'} />
      </TouchableOpacity>
    );
  });
  return (
    <GlobalThemeView>
      <View style={styles.globalContainer}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={{marginRight: 'auto'}}
            onPress={() => {
              navigate.goBack();
            }}>
            <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
          </TouchableOpacity>
          <ThemeText
            styles={{...styles.topBarText}}
            content={'Historical Purchases'}
          />
        </View>
        <ScrollView style={{marginTop: 30}}>{purchaseElements}</ScrollView>
      </View>
    </GlobalThemeView>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    width: WINDOWWIDTH,
    ...CENTER,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    ...CENTER,
  },
  topBarText: {
    fontSize: SIZES.large,
    textTransform: 'capitalize',
    includeFontPadding: false,
  },
});
