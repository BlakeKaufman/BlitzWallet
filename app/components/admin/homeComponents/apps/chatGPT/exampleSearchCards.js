import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import {COLORS} from '../../../../../constants';
import {useGlobalContextProvider} from '../../../../../../context-store/context';

export default function ExampleGPTSearchCard({
  submitChaMessage,
  setUserChatText,
}) {
  const {theme} = useGlobalContextProvider();
  return (
    <View style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps={'always'}
        horizontal
        showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => {
            submitChaMessage('Explain Bitcoin to me like I am 5');
          }}
          style={[
            styles.contentContainer,

            {
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
              marginLeft: 0,
            },
          ]}>
          <ThemeText
            styles={styles.headerText}
            content={'Explain Bitcoin to me'}
          />
          <ThemeText styles={styles.subHeaderText} content={'like I am 5'} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            submitChaMessage('Write a thank-you note to my interviwer');
          }}
          style={[
            styles.contentContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
            },
          ]}>
          <ThemeText
            styles={styles.headerText}
            content={'Write a thank-you note'}
          />
          <ThemeText
            styles={styles.subHeaderText}
            content={'to my interviwer'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            submitChaMessage(
              'Create a morning routinie to boost my productivity',
            );
          }}
          style={[
            styles.contentContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
            },
          ]}>
          <ThemeText
            styles={styles.headerText}
            content={'Create a morning routinie'}
          />
          <ThemeText
            styles={styles.subHeaderText}
            content={'to boost my productivity'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            submitChaMessage('Test my knowledge on ancient civilizations');
          }}
          style={[
            styles.contentContainer,
            {
              backgroundColor: theme
                ? COLORS.darkModeBackgroundOffset
                : COLORS.lightModeBackgroundOffset,
            },
          ]}>
          <ThemeText styles={styles.headerText} content={'Test my knowledge'} />
          <ThemeText styles={styles.sub} content={'on ancient civilizations'} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 'auto',
    marginBottom: 10,
  },
  contentContainer: {
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 20,
  },
  headerText: {
    fontWeight: '700',
  },
  subHeaderText: {
    fontWeight: '300',
  },
});
