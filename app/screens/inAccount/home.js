import {BackHandler} from 'react-native';
import {useEffect} from 'react';

import HomeLightning from '../../components/admin/homeComponents/homeLightning';

import handleBackPress from '../../hooks/handleBackPress';
import {useIsFocused} from '@react-navigation/native';

export default function AdminHome({navigation}) {
  console.log('admin home');

  const isFocused = useIsFocused();

  function handleBackPressFunction() {
    BackHandler.exitApp();

    return true;
  }
  useEffect(() => {
    if (!isFocused) return;
    console.log('RUNNIN IN APP INDES USE EFFECT');
    handleBackPress(handleBackPressFunction);
  }, [isFocused]);

  return <HomeLightning tabNavigation={navigation} />;
}
