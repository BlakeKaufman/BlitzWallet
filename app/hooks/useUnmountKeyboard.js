import {useEffect, useState} from 'react';
import {Keyboard} from 'react-native';
export default function useUnmountKeyboard() {
  useEffect(() => {
    return () => {
      Keyboard.dismiss();
      console.log('component unmounted');
    };
  }, []);
}
