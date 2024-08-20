import {useEffect, useState} from 'react';
import {Appearance} from 'react-native';

export default function SetNaitveAppearence() {
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({colorScheme}) => {
      setStatusBarStyle(colorScheme === 'dark' ? 'light' : 'dark');
    });

    // Clean up the subscription on unmount
    return () => subscription.remove();
  }, []);
}
