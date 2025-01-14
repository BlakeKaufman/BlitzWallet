import Ably from 'ably';
import functions from '@react-native-firebase/functions';

export const AblyRealtime = new Ably.Realtime({
  authCallback: async (data, callback) => {
    try {
      const response = await functions().httpsCallable('ablyToken')();
      console.log(response.data);
      callback(null, response.data);
    } catch (e) {
      callback(e, null);
    }
  },
});
