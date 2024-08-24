import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import {COLORS} from '../../../../../constants';
import {useGlobalContextProvider} from '../../../../../../context-store/context';
import {shuffleArray} from '../../../../../functions';
import {searchQueries} from './contants/searchCardContent';

export default function ExampleGPTSearchCard({submitChaMessage}) {
  const {theme} = useGlobalContextProvider();
  const cardElements = shuffleArray(searchQueries)
    .slice(0, 6)
    .map((item, index) => {
      return (
        <TouchableOpacity
          key={index}
          onPress={() => {
            submitChaMessage(item.fullString);
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
          <ThemeText styles={styles.headerText} content={item.topLine} />
          <ThemeText styles={styles.subHeaderText} content={item.bottomLine} />
        </TouchableOpacity>
      );
    });
  return (
    <View style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps={'always'}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {cardElements}
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
