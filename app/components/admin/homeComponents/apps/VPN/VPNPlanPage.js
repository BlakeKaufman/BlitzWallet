import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import {ThemeText} from '../../../../../functions/CustomElements';
import {useEffect, useMemo, useRef, useState} from 'react';
import axios from 'axios';
import {CENTER, COLORS, FONT, SIZES} from '../../../../../constants';

import {useGlobalContextProvider} from '../../../../../../context-store/context';
import VPNDurationSlider from './components/durationSlider';
import CustomButton from '../../../../../functions/CustomElements/button';
import FullLoadingScreen from '../../../../../functions/CustomElements/loadingScreen';

export default function VPNPlanPage() {
  const [contriesList, setCountriesList] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const deviceSize = useWindowDimensions();
  const {theme} = useGlobalContextProvider();
  const [selectedDuration, setSelectedDuration] = useState('week');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [generatedFile, setGeneratedFile] = useState(null);

  useEffect(() => {
    (async () => {
      setCountriesList(
        (await axios.get('https://lnvpn.net/api/v1/countryList')).data,
      );
    })();
  }, []);

  const countryElements = useMemo(() => {
    return [...contriesList]
      .filter(item =>
        item.country
          .slice(5)
          .toLowerCase()
          .startsWith(searchInput.toLocaleLowerCase()),
      )
      .map(item => {
        if (item.cc == 2) return <View></View>;
        return (
          <TouchableOpacity
            onPress={() => {
              setSearchInput(item.country);
              setSelectedCountry(item.cc);
            }}
            style={{paddingVertical: 10}}
            key={item.country}>
            <ThemeText styles={{textAlign: 'center'}} content={item.country} />
          </TouchableOpacity>
        );
      });
  }, [searchInput, contriesList]);

  return (
    <>
      {isPaying ? (
        <>
          {generatedFile ? (
            <View style={{flex: 1}}>
              <ThemeText content={'GENERATED'} />
            </View>
          ) : (
            <View
              style={{
                flex: 1,
              }}>
              <FullLoadingScreen text={'Generating VPN file'} />
            </View>
          )}
        </>
      ) : (
        <View style={{flex: 1}}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            style={{flex: 1}}>
            <View style={{flex: 1, marginTop: 10}}>
              <View
                style={{
                  flex: 1,
                  maxHeight: deviceSize.height / 2,
                }}>
                <TextInput
                  autoFocus={true}
                  onChangeText={setSearchInput}
                  value={searchInput}
                  placeholder="United States"
                  placeholderTextColor={
                    theme ? COLORS.darkModeText : COLORS.lightModeText
                  }
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme
                        ? COLORS.darkModeBackgroundOffset
                        : COLORS.lightModeBackgroundOffset,
                      color: theme ? COLORS.darkModeText : COLORS.lightModeText,
                    },
                  ]}
                />
                <ScrollView>{countryElements}</ScrollView>
              </View>
              <VPNDurationSlider
                setSelectedDuration={setSelectedDuration}
                selectedDuration={selectedDuration}
              />
              <CustomButton
                buttonStyles={{marginTop: 'auto', ...CENTER}}
                textContent={'Confirm'}
                actionFunction={() => {
                  console.log(selectedDuration, selectedCountry);

                  setIsPaying(true);

                  setTimeout(() => {
                    setGeneratedFile(true);
                  }, 5000);
                }}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  textInput: {
    width: '100%',
    padding: 10,
    ...CENTER,
    fontSize: SIZES.medium,
    fontFamily: FONT.Title_Regular,
    borderRadius: 8,
    marginBottom: 20,
  },
});
