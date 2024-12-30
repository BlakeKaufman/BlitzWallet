import Ably from 'ably';
import getAppCheckToken from '../getAppCheckToken';

export const AblyRealtime = new Ably.Realtime({
  authCallback: async (data, callback) => {
    try {
      const firebaseAppCheckToken = await getAppCheckToken();
      const response = await fetch(process.env.ABLY_AUTH_URL, {
        headers: {
          'X-Firebase-AppCheck': firebaseAppCheckToken?.token,
        },
      });

      const tokenRequest = await response.json();

      callback(null, tokenRequest);
    } catch (e) {
      callback(e, null);
    }
  },
});
