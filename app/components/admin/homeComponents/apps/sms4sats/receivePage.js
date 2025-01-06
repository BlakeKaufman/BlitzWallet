import {StyleSheet, View} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import {SIZES} from '../../../../../constants';

export default function SMSMessagingReceivedPage() {
  return (
    <>
      <View style={styles.homepage}>
        <ThemeText
          styles={{textAlign: 'center', fontSize: SIZES.large}}
          content={'Receive page'}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  homepage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
