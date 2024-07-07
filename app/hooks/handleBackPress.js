import {BackHandler} from 'react-native';

export default function handleBackPress(callback) {
  BackHandler.addEventListener('hardwareBackPress', callback);
  return () => {
    console.log('RUNNING IN REMOVE FUNCTION');
    BackHandler.remove();
  };
}
