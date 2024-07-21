import {useNavigation} from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../constants';

import {useGlobalContextProvider} from '../../../context-store/context';

import {UserTransactions} from '../../components/admin';
import {backArrow} from '../../constants/styles';
import {GlobalThemeView} from '../../functions/CustomElements';
import {WINDOWWIDTH} from '../../constants/theme';
import {useEffect, useState} from 'react';
import handleBackPress from '../../hooks/handleBackPress';

export default function ViewAllTxPage() {
  const navigate = useNavigation();
  const {theme, nodeInformation, liquidNodeInformation} =
    useGlobalContextProvider();

  function handleBackPressFunction() {
    console.log('RUNNIN IN CONTACTS BACK BUTTON');
    navigate.goBack();
    return true;
  }

  useEffect(() => {
    handleBackPress(handleBackPressFunction);
  }, []);

  return (
    <GlobalThemeView styles={{paddingBottom: 0}}>
      <View style={styles.globalContainer}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              navigate.goBack();
            }}>
            <Image style={[backArrow]} source={ICONS.smallArrowLeft} />
          </TouchableOpacity>
          <Text
            style={[
              styles.mainHeader,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            Transactions
          </Text>
          <TouchableOpacity
            onPress={() => {
              navigate.navigate('ConfirmExportPayments');
            }}>
            <Image style={[backArrow]} source={ICONS.share} />
            {/* <Text
              style={[
                styles.shareText,
                {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
              ]}>
              Share
            </Text> */}
          </TouchableOpacity>
        </View>

        <UserTransactions from="viewAllTxPage" />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mainHeader: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.large,
  },
  shareText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },
});
