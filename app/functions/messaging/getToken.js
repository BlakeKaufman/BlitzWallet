import Ably from 'ably';

export const AblyRealtime = new Ably.Realtime({
  authCallback: async (data, callback) => {
    try {
      const response = await fetch(process.env.ABLY_AUTH_URL);

      const tokenRequest = await response.json();

      callback(null, tokenRequest);
    } catch (e) {
      callback(e, null);
    }
  },
});
