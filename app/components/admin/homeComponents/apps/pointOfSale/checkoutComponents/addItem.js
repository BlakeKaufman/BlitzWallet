import {
  KeyboardAvoidingView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {CENTER, COLORS, FONT, SIZES} from '../../../../../../constants';
import {useNavigation} from '@react-navigation/native';
import {useGlobalContextProvider} from '../../../../../../../context-store/context';
import {useState} from 'react';
import {randomUUID} from 'expo-crypto';
import {ThemeText} from '../../../../../../functions/CustomElements';

export default function AddCheckoutItem(props) {
  const {theme} = useGlobalContextProvider();
  const navigate = useNavigation();

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
      <View style={styles.addItemContainer}>
        <KeyboardAvoidingView
          behavior={'height'}
          style={styles.addItemAvoidingView}>
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.addItemInnerContainer,
              {
                backgroundColor: theme
                  ? COLORS.darkModeBackground
                  : COLORS.lightModeBackground,
              },
            ]}>
            <ThemeText
              content={`${isEditing ? 'Edit' : 'Add'} Item`}
              styles={{...styles.addItemHeader}}
            />
            <ThemeText
              content={'Priced in USD'}
              styles={{...styles.addItemSubHeader}}
            />

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
                <ThemeText styles={{...styles.button}} content={'Cancel'} />
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
                <ThemeText styles={{...styles.button}} content={'Ok'} />
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
    paddingVertical: 10,
  },

  addItemContainer: {
    backgroundColor: COLORS.opaicityGray,
    flex: 1,
  },
  addItemAvoidingView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemInnerContainer: {width: '90%', padding: 10, borderRadius: 8},
  addItemHeader: {
    fontSize: SIZES.large,

    textAlign: 'center',
  },
  addItemSubHeader: {
    fontSize: SIZES.small,

    textAlign: 'center',
    marginBottom: 20,
  },
});
