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

export default function LSPPage() {
  const {theme, nodeInformation} = useGlobalContextProvider();
  const navigate = useNavigation();

  return (
    <View style={styles.globalContainer}>
      <View
        style={[
          styles.contentContainer,
          {
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
          },
        ]}>
        <Text
          style={[
            styles.titleText,
            {
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          What is an LSP?
        </Text>

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
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
          },
        ]}>
        <Text
          style={[
            styles.titleText,
            {
              marginBottom: 5,
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          Name
        </Text>
        <TouchableOpacity
          style={styles.descriptionContainer}
          onPress={() => {
            copyToClipboard(nodeInformation.lsp[0]?.name, navigate);
          }}>
          <Text
            style={[
              styles.descriptionText,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            {nodeInformation.lsp[0]?.name || 'N/A'}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.contentContainer,
          {
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
          },
        ]}>
        <Text
          style={[
            styles.titleText,
            {
              marginBottom: 5,
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          ID
        </Text>
        <TouchableOpacity
          style={styles.descriptionContainer}
          onPress={() => {
            copyToClipboard(nodeInformation.lsp[0]?.id, navigate);
          }}>
          <Text
            style={[
              styles.descriptionText,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            84a762b4-fde2-4a62-a4e9-51ad426b725e
            {/* {nodeInformation.lsp[0]?.id || 'N/A'} */}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.contentContainer,
          {
            backgroundColor: theme
              ? COLORS.darkModeBackgroundOffset
              : COLORS.lightModeBackgroundOffset,
          },
        ]}>
        <Text
          style={[
            styles.titleText,
            {
              marginBottom: 5,
              color: theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          Host
        </Text>
        <TouchableOpacity
          style={styles.descriptionContainer}
          onPress={() => {
            copyToClipboard(nodeInformation.lsp[0]?.host, navigate);
          }}>
          <Text
            style={[
              styles.descriptionText,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            {nodeInformation.lsp[0]?.host || 'N/A'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
    backgroundColor: COLORS.offsetBackground,
    padding: 8,
    borderRadius: 8,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: FONT.Title_Bold,
    fontSize: SIZES.medium,
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
    fontFamily: FONT.Descriptoin_Regular,
    fontSize: SIZES.medium,
    textAlign: 'right',
  },
});
