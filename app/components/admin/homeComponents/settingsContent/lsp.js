import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {COLORS, FONT, ICONS, SIZES} from '../../../../constants';

import {useGlobalContextProvider} from '../../../../../context-store/context';
import {useNavigation} from '@react-navigation/native';
import {copyToClipboard} from '../../../../functions';
import {ThemeText} from '../../../../functions/CustomElements';
import GetThemeColors from '../../../../hooks/themeColors';

export default function LSPPage() {
  const {theme, nodeInformation} = useGlobalContextProvider();
  const navigate = useNavigation();
  const {textColor, backgroundOffset, backgroundColor} = GetThemeColors();

  return (
    <>
      <View
        style={[
          styles.contentContainer,
          {
            backgroundColor: backgroundOffset,
          },
        ]}>
        <ThemeText content={'What is an LSP?'} styles={{...styles.titleText}} />
        <TouchableOpacity
          onPress={() =>
            // props.setDisplayPopup({isDisplayed: true, type: 'LSPInfo'})
            navigate.navigate('LspDescriptionPopup')
          }>
          <Image style={{width: 20, height: 20}} source={ICONS.aboutIcon} />
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.contentContainer,
          {
            backgroundColor: backgroundOffset,
          },
        ]}>
        <ThemeText content={'Name'} styles={{...styles.titleText}} />
        <TouchableOpacity
          style={styles.descriptionContainer}
          onPress={() => {
            copyToClipboard(nodeInformation.lsp[0]?.name, navigate);
          }}>
          <ThemeText
            content={nodeInformation.lsp[0]?.name || 'N/A'}
            styles={{...styles.descriptionText}}
          />
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.contentContainer,
          {
            backgroundColor: backgroundOffset,
          },
        ]}>
        <ThemeText content={'ID'} styles={{...styles.titleText}} />

        <TouchableOpacity
          style={styles.descriptionContainer}
          onPress={() => {
            copyToClipboard(nodeInformation.lsp[0]?.id, navigate);
          }}>
          <ThemeText
            content={nodeInformation.lsp[0]?.id || 'N/A'}
            styles={{...styles.descriptionText}}
          />
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.contentContainer,
          {
            backgroundColor: backgroundOffset,
          },
        ]}>
        <ThemeText content={'Host'} styles={{...styles.titleText}} />

        <TouchableOpacity
          style={styles.descriptionContainer}
          onPress={() => {
            copyToClipboard(nodeInformation.lsp[0]?.host, navigate);
          }}>
          <ThemeText
            content={nodeInformation.lsp[0]?.host || 'N/A'}
            styles={{...styles.descriptionText}}
          />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: COLORS.offsetBackground,
    padding: 8,
    borderRadius: 8,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  descriptionContainer: {
    flex: 1,
    width: '100%',
    flexWrap: 'wrap',
    marginLeft: 15,
  },
  descriptionText: {
    width: '100%',
    flexWrap: 'wrap',
    textAlign: 'right',
  },
});
