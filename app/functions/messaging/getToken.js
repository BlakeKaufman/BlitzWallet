import Ably from 'ably';

export function connectToAlby() {
  //   auth does not work, but API does
  //   const realtime = new Alby.Realtime({
  //     authUrl: 'https://blitz-wallet.com/.netlify/functions/albyToken',
  //   });

  const realtime = new Ably.Realtime({
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

  return realtime;
}
