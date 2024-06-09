import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useGlobalContextProvider} from '../../../../../../../context-store/context';
import {CENTER, COLORS, FONT, SIZES} from '../../../../../../constants';
import * as FileSystem from 'expo-file-system';
import {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {ThemeText} from '../../../../../../functions/CustomElements';

export default function LibraryScreen({setAddedItems, setPageTypeAttributes}) {
  const {theme, masterInfoObject} = useGlobalContextProvider();
  const navigate = useNavigation();

  const [savedItems, setSavedItems] = useState(null);

  useEffect(() => {
    (async () => {
      const storedItems = (await getDataFromFilesystem()) || [];
      setSavedItems(storedItems);
    })();
  }, []);
  if (savedItems === null) return;
  return (
    <View style={{flex: 1, width: '90%', ...CENTER}}>
      <View style={{flex: 1}}>
        <ScrollView>
          {savedItems.map((item, index) => {
            return (
              <View style={styles.itemContainer} key={index}>
                <View>
                  <ThemeText
                    content={item.name}
                    styles={{fontSize: SIZES.xLarge}}
                  />
                  <ThemeText content={`$ ${parseFloat(item.price)}`} />
                </View>
                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    onPress={() => {
                      setAddedItems(prev => {
                        return prev.concat({
                          amount: parseFloat(item.price) * 100,
                        });
                      });
                      setPageTypeAttributes(prev => {
                        return {
                          keypad: {
                            isSelected: true,
                            layoutAttributes: prev.keypad.layoutAttributes,
                          },
                          library: {
                            isSelected: false,
                            layoutAttributes: prev.library.layoutAttributes,
                          },
                        };
                      });
                    }}>
                    <ThemeText
                      content={'Add'}
                      styles={{...styles.itemButtons}}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      navigate.navigate('AddCheckoutItemPage', {
                        saveNewItemToFilesystem: saveNewItemToFilesystem,
                        isEditing: true,
                        item: {
                          name: item.name,
                          price: item.price,
                          uuid: item.uuid,
                        },
                      });
                    }}>
                    <ThemeText
                      content={'Edit'}
                      styles={{...styles.itemButtons}}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteItem(item.uuid)}>
                    <ThemeText
                      content={'Delete'}
                      styles={{...styles.itemButtons}}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
      <TouchableOpacity
        onPress={() =>
          navigate.navigate('AddCheckoutItemPage', {
            saveNewItemToFilesystem: saveNewItemToFilesystem,
            isEditing: false,
          })
        }
        style={[
          styles.addItemButtion,
          {
            borderColor: theme ? COLORS.darkModeText : COLORS.lightModeText,
          },
        ]}>
        <ThemeText
          styles={{
            textAlign: 'center',
          }}
          content={'Add Item'}
        />
      </TouchableOpacity>
    </View>
  );

  async function getDataFromFilesystem() {
    try {
      const dir = FileSystem.documentDirectory;
      const fileName = 'POSItems.csv';
      const filePath = `${dir}${fileName}`;

      const data = await FileSystem.readAsStringAsync(filePath);

      const formatedData = data
        .split('\n')
        .map((item, index) => {
          if (index === 0) return false;
          const [name, price, uuid] = item.split(',');

          return {name, price, uuid};
        })
        .filter(item => item);

      console.log(formatedData);

      return formatedData;
    } catch (err) {
      //   console.log(err);
      return false;
    }
  }

  async function deleteItem(deletingUUID) {
    try {
      const savedData =
        ((await getDataFromFilesystem()) || []).map(item => [
          item.name,
          item.price,
          item.uuid,
        ]) || [];
      //   return;
      const headers = [['Name', 'Price', 'uuid']];

      const newSavedItems = savedData.filter(item => {
        const [name, price, uuid] = item;

        console.log(uuid === deletingUUID);

        if (uuid === deletingUUID) return false;
        else return item;
      });

      const csvData = headers
        .concat(newSavedItems.map(arr => arr.join(',')))
        .join('\n');

      const dir = FileSystem.documentDirectory;

      const fileName = 'POSItems.csv';
      const filePath = `${dir}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, csvData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      setSavedItems(
        newSavedItems.map(item => ({
          name: item[0],
          price: item[1],
          uuid: item[2],
        })),
      );
    } catch (err) {
      console.log(err);
    }
  }

  async function saveNewItemToFilesystem(newItem, isEditing) {
    try {
      const savedData =
        ((await getDataFromFilesystem()) || []).map(item => [
          item.name,
          item.price,
          item.uuid,
        ]) || [];

      const headers = [['Name', 'Price', 'uuid']];
      let newSavedItems;

      if (isEditing) {
        console.log('IS RUNNING');
        newSavedItems = savedData.map(item => {
          const [name, price, uuid] = item;

          console.log(uuid === newItem.uuid);

          if (uuid === newItem.uuid) {
            return [newItem.name, newItem.price, newItem.uuid];
          } else return item;
        });
      } else {
        newSavedItems = savedData.concat([
          [newItem.name, newItem.price, newItem.uuid],
        ]);
      }

      const csvData = headers
        .concat(newSavedItems.map(arr => arr.join(',')))
        .join('\n');

      const dir = FileSystem.documentDirectory;

      const fileName = 'POSItems.csv';
      const filePath = `${dir}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, csvData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      setSavedItems(
        newSavedItems.map(item => ({
          name: item[0],
          price: item[1],
          uuid: item[2],
        })),
      );
    } catch (err) {
      navigate.navigate('ErrorScreen', {
        errorMessage: 'Error when creating file',
      });
    }
  }
}

const styles = StyleSheet.create({
  itemButtons: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    marginHorizontal: 8,
  },

  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },

  addItemButtion: {
    width: '100%',
    borderWidth: 2,
    marginTop: 'auto',
    borderRadius: 8,
    paddingVertical: 12,
  },
});
