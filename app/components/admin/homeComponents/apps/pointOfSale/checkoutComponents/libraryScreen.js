import {Text, TouchableOpacity, View} from 'react-native';
import {useGlobalContextProvider} from '../../../../../../../context-store/context';
import {CENTER, COLORS, FONT, SIZES} from '../../../../../../constants';

export default function LibraryScreen({setAddedItems}) {
  const {theme, masterInfoObject} = useGlobalContextProvider();
  return (
    <View style={{flex: 1, width: '90%', ...CENTER}}>
      <TouchableOpacity
        style={{
          width: '100%',

          borderRadius: 8,
          borderColor: theme
            ? COLORS.darkModeBackgroundOffset
            : COLORS.lightModeBackgroundOffset,
          borderWidth: 2,
          marginTop: 'auto',
        }}>
        <Text
          style={{
            paddingVertical: 12,
            textAlign: 'center',
            fontSize: SIZES.medium,
            fontFamily: FONT.Title_Regular,
          }}>
          Add Item
        </Text>
      </TouchableOpacity>
    </View>
  );
}
