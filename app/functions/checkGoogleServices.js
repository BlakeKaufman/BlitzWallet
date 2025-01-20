import firebase from '@react-native-firebase/app';

export function checkGooglePlayServices() {
  const app = firebase.app();
  const areGoogleServicesEnabled =
    app.utils().playServicesAvailability.isAvailable;

  return areGoogleServicesEnabled;
}
