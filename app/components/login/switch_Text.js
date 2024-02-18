import {View, Text, Switch, StyleSheet} from 'react-native';

import {COLORS, FONT, SIZES} from '../../constants';

export default function Switch_Text(props) {
  return (
    <View
      style={{
        ...styles.container,
        borderTopWidth: props.for === 'bottom' ? 0 : 1,
      }}>
      <Text style={styles.text}>{props.text}</Text>
      <Switch
        trackColor={{false: '#767577', true: COLORS.primary}}
        // thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}

        onChange={() => props.toggleSwitch(props.for)}
        value={
          props.isEnabled.filter(state => state.for === props.for)[0].isEnabled
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginLeft: 'auto',
    marginRight: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    borderTopColor: COLORS.gray,
    borderBottomColor: COLORS.gray,

    borderTopWidth: 1,
    borderBottomWidth: 1,

    paddingVertical: 20,
  },
  text: {
    width: '80%',
    fontSize: SIZES.medium,
    fontFamily: FONT.Descriptoin_Regular,
    letterSpacing: 0.2,
    lineHeight: 25,
    color: COLORS.lightModeText,
  },
});
