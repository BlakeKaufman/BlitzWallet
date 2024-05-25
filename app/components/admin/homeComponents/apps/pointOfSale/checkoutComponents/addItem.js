import {
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {CENTER, COLORS, FONT, ICONS, SIZES} from '../../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../../../context-store/context';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ANDROIDSAFEAREA} from '../../../../../../constants/styles';
import {useState} from 'react';
import {randomUUID} from 'expo-crypto';

export default function AddCheckoutItem(props) {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();
  const isEditing = props.route.params.isEditing;
  const item = isEditing && props.route.params.item;
  const [newItem, setNewItem] = useState({
    name: isEditing ? item.name : '',
    price: isEditing ? item.price : '',
  });
  const saveNewItemToFilesystem = props.route.params.saveNewItemToFilesystem;

  console.log(item);
  return (
    <TouchableWithoutFeedback onPress={navigate.goBack}>
      <View
        style={{
          backgroundColor: COLORS.opaicityGray,
          flex: 1,
          paddingTop: insets.top < 20 ? ANDROIDSAFEAREA : insets.top,
          paddingBottom: insets.bottom < 20 ? ANDROIDSAFEAREA : insets.bottom,
        }}>
        <KeyboardAvoidingView
          behavior={'height'}
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          {/* <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigate.goBack()}>
              <Image
                style={[styles.topBarIcon, {transform: [{translateX: -6}]}]}
                source={ICONS.smallArrowLeft}
              />
            </TouchableOpacity>

            <Text
              style={[
                styles.topBarText,
                {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
              ]}>
              Add Item
            </Text>
          </View> */}
          <TouchableOpacity
            activeOpacity={1}
            style={{
              width: '90%',
              backgroundColor: theme
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground,
              padding: 10,
              borderRadius: 8,
            }}>
            <Text
              style={{
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                fontSize: SIZES.large,
                fontFamily: FONT.Title_Regular,
                textAlign: 'center',
              }}>
              {isEditing ? 'Edit' : 'Add'} Item
            </Text>
            <Text
              style={{
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                fontSize: SIZES.small,
                fontFamily: FONT.Title_Regular,
                textAlign: 'center',
                marginBottom: 20,
              }}>
              Priced in USD
            </Text>

            <View style={{width: '90%', ...CENTER}}>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: theme
                      ? COLORS.darkModeText
                      : COLORS.lightModeText,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}
                onChangeText={e => {
                  setNewItem(prev => {
                    return {...prev, name: e};
                  });
                }}
                placeholderTextColor={
                  theme ? COLORS.darkModeText : COLORS.lightModeText
                }
                placeholder="Name"
                value={newItem.name}
              />
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: theme
                      ? COLORS.darkModeText
                      : COLORS.lightModeText,
                    color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                  },
                ]}
                placeholderTextColor={
                  theme ? COLORS.darkModeText : COLORS.lightModeText
                }
                onChangeText={e => {
                  setNewItem(prev => {
                    return {...prev, price: e};
                  });
                }}
                keyboardType="numeric"
                placeholder="Price"
                value={newItem.price}
              />
            </View>

            <View style={{width: '100%', flexDirection: 'row', marginTop: 20}}>
              <TouchableOpacity
                onPress={navigate.goBack}
                style={[
                  styles.buttonsContainer,
                  {
                    borderRightWidth: 1,
                    borderColor: theme
                      ? COLORS.darkModeText
                      : COLORS.lightModeText,
                  },
                ]}>
                <Text
                  style={[
                    styles.button,
                    {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                  ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (newItem.name.length === 0 || newItem.price.length === 0)
                    return;
                  saveNewItemToFilesystem(
                    {...newItem, uuid: isEditing ? item.uuid : randomUUID()},
                    isEditing,
                  );
                  navigate.goBack();
                }}
                style={styles.buttonsContainer}>
                <Text
                  style={[
                    styles.button,
                    {color: theme ? COLORS.darkModeText : COLORS.lightModeText},
                  ]}>
                  Ok
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    ...CENTER,
  },
  topBarText: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.large,
    transform: [{translateX: -15}],
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  topBarIcon: {
    width: 30,
    height: 30,
  },

  textInput: {
    width: '100%',
    borderWidth: 1,
    marginVertical: 5,
    paddingVertical: 8,
    borderRadius: 8,
    paddingLeft: 10,
  },

  buttonsContainer: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    fontFamily: FONT.Title_Regular,
    fontSize: SIZES.medium,
    paddingVertical: 10,
  },
});
