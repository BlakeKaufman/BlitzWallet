import {
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import {ThemeText} from '../../../../functions/CustomElements';
import GetThemeColors from '../../../../hooks/themeColors';
import {SIZES, CENTER} from '../../../../constants';

export default function ExpandedMessageHalfModal(props) {
  const {message, slideHeight} = props;

  const {backgroundOffset} = GetThemeColors();

  return (
    <TouchableWithoutFeedback>
      <View
        style={{
          ...styles.messageContainer,
          height: useWindowDimensions().height * slideHeight,
        }}>
        <View
          style={[
            styles.topBar,
            {
              backgroundColor: backgroundOffset,
            },
          ]}
        />
        <View style={styles.messageWrapper}>
          <ThemeText styles={styles.messageHeader} content={'Full message'} />
          <ThemeText
            styles={{
              textAlign: 'center',
            }}
            content={message || 'No description'}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: 120,
    height: 8,
    marginTop: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  messageContainer: {
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 0,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  messageWrapper: {flex: 1, width: '90%', ...CENTER},
  messageHeader: {
    fontSize: SIZES.large,
    marginBottom: 10,
    textAlign: 'center',
  },
});
