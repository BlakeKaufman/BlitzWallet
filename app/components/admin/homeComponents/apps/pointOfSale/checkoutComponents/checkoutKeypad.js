import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {CENTER, SIZES} from '../../../../../../constants';

import {ThemeText} from '../../../../../../functions/CustomElements';

const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '+'];

export default function CheckoutKeypad({setChargeAmount, setAddedItems}) {
  return (
    <View style={styles.keypadContainer}>
      {(() => {
        let keyElements = [];
        let tempArr = [];
        KEYS.forEach((key, index) => {
          tempArr.push(
            <TouchableOpacity
              onPress={() => {
                handleKeyPress(key);
              }}
              onLongPress={() => {
                if (key != 'C') return;

                setAddedItems([]);
              }}
              style={[styles.keypadItemContainer]}
              key={index}>
              <ThemeText content={key} styles={{...styles.keypadItem}} />
            </TouchableOpacity>,
          );

          if ((index % 3 === 2 && index != 0) || index === KEYS.length - 1) {
            keyElements.push(
              <View key={index} style={[styles.keypadRow]}>
                {tempArr}
              </View>,
            );
            tempArr = [];
          }
        });

        return keyElements;
      })()}
    </View>
  );

  function handleKeyPress(key) {
    if (typeof key === 'number') {
      setChargeAmount(prev => (prev += `${key}`));
    } else {
      if (key === 'C') {
        setChargeAmount(0);
      } else {
        setChargeAmount(chargeAmount => {
          setAddedItems(prev => {
            const newItem = {amount: chargeAmount.slice(1)};

            let tempArr = prev;
            tempArr.push(newItem);

            return tempArr;
          });

          return 0;
        });
      }
    }
  }
}

const styles = StyleSheet.create({
  keypadContainer: {
    flex: 1,
    width: '100%',
    ...CENTER,
    justifyContent: 'flex-end',
  },
  keypadRow: {
    width: '100%',
    height: '20%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keypadItemContainer: {
    width: '33%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  keypadItem: {
    fontSize: SIZES.large,
  },
});
