import {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {CENTER, COLORS, FONT, SHADOWS, SIZES} from '../../../../constants';
import * as FileSystem from 'expo-file-system';

export default function ViewAllLiquidSwaps(props) {
  const {masterInfoObject} = useGlobalContextProvider();
  const liquidSwaps = masterInfoObject.liquidSwaps || [];

  const transectionElements =
    liquidSwaps.length !== 0 &&
    liquidSwaps.map((tx, id) => {
      return (
        <View
          style={[
            styles.swapContainer,
            {
              backgroundColor: props.theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,
              marginVertical: 10,
            },
          ]}
          key={id}>
          <Text
            style={{
              color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
              fontFamily: FONT.Title_Regular,
              fontSize: SIZES.medium,
            }}>
            {tx.id}
          </Text>

          <TouchableOpacity
            style={[
              styles.buttonContainer,
              {
                backgroundColor: props.theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText,
              },
            ]}
            onPress={() => {
              downloadRefundFile(tx.id);
            }}>
            <Text
              style={[
                styles.buttonText,
                {
                  color: props.theme
                    ? COLORS.lightModeText
                    : COLORS.darkModeText,
                },
              ]}>
              Download
            </Text>
          </TouchableOpacity>
        </View>
      );
    });

  return (
    <View style={styles.globalContainer}>
      {liquidSwaps.length === 0 ? (
        <Text
          style={[
            styles.noTxText,
            {color: props.theme ? COLORS.darkModeText : COLORS.lightModeText},
          ]}>
          You have no liquid transactions
        </Text>
      ) : (
        <View style={{flex: 1, width: '90%'}}>
          <Text
            style={[
              styles.noTxText,
              {
                color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
                marginTop: 50,
                ...CENTER,
                marginBottom: 20,
              },
            ]}>
            List of liquid transactions
          </Text>
          <View
            style={[
              styles.backgroundScrollContainer,
              {
                backgroundColor: props.theme
                  ? COLORS.darkModeBackgroundOffset
                  : COLORS.lightModeBackgroundOffset,
              },
            ]}>
            <ScrollView style={{flex: 1}}>{transectionElements}</ScrollView>
          </View>
        </View>
      )}
    </View>
  );

  async function downloadRefundFile(id) {
    try {
      const [filteredFile] = liquidSwaps.filter(tx => {
        return tx.id === id;
      });

      delete filteredFile.adjustedSatAmount;

      const dir = FileSystem.documentDirectory;
      const fileName = `${id}-Blitz-LiquidSwap.json`;
      const filePath = `${dir}${fileName}`;
      const data = JSON.stringify(filteredFile);

      const test = await FileSystem.writeAsStringAsync(filePath, data);

      await Share.share({
        title: 'BlitzWallet',
        // message: `${csvData}`,
        url: `file://${filePath}`,
        type: '',
      });

      console.log(test);
    } catch (err) {
      console.log(err);
    }
  }
}
const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noTxText: {
    width: '90%',
    fontSize: SIZES.large,
    fontFamily: FONT.Title_Regular,
    textAlign: 'center',
  },
  backgroundScrollContainer: {
    flex: 1,
    height: 400,
    maxWidth: 400,
    padding: 10,
    borderRadius: 8,
  },

  swapContainer: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },

  buttonContainer: {
    paddingVertical: 8,
    paddingHorizontal: 17,
    borderRadius: 9,
  },
  buttonText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
  },
});
