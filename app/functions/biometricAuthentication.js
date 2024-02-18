import * as LocalAuthentication from 'expo-local-authentication';

async function hasHardware() {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    return new Promise(resolve => {
      resolve(compatible);
    });
  } catch (err) {
    console.log(err);
    return new Promise(resolve => {
      resolve(false);
    });
  }
}
async function hasSavedProfile() {
  try {
    const savedBiometrics = await LocalAuthentication.isEnrolledAsync();

    return new Promise(resolve => {
      resolve(savedBiometrics);
    });
  } catch (err) {
    return new Promise(resolve => {
      resolve(false);
    });
  }
}
async function handleLogin() {
  const LocalAuthenticationOptions = {
    promptMessage: 'Face ID',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
    fallbackLabel: 'Login with pin',
  };
  try {
    const didAuthenticate = await LocalAuthentication.authenticateAsync(
      LocalAuthenticationOptions,
    );

    return new Promise(resolve => {
      resolve(didAuthenticate.success);
    });
  } catch (err) {
    return new Promise(resolve => {
      resolve(false);
    });
  }
}

export {hasHardware, hasSavedProfile, handleLogin};
