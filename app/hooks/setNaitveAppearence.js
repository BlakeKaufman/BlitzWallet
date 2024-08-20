import {useEffect, useState} from 'react';
import {Appearance} from 'react-native';
export default function SetNaitveAppearence() {
  const [nativeColorScheme, setNativeColorScheme] = useState(
    Appearance.getColorScheme(),
  );
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({colorScheme}) => {
      setNativeColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
    });

    // Clean up the subscription on unmount
    return () => subscription.remove();
  }, []);
  return nativeColorScheme;
}
