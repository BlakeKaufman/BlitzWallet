import {firebase} from '@react-native-firebase/app-check';
import {atob} from 'react-native-quick-base64';
let cachedAppCheckToken = null;

function isTokenExpired(token) {
  if (!token) return true;
  const [, payload] = token.split('.');
  const decodedPayload = JSON.parse(atob(payload));
  const currentTime = Math.floor(Date.now() / 1000);
  return decodedPayload.exp < currentTime;
}

export default async function getAppCheckToken() {
  try {
    if (!cachedAppCheckToken || isTokenExpired(cachedAppCheckToken.token)) {
      cachedAppCheckToken = await firebase.appCheck().getToken(true); // Force refresh
    }

    return {didWork: true, token: cachedAppCheckToken.token};
  } catch (err) {
    return {didWork: false, error: JSON.stringify(err)};
  }
}
