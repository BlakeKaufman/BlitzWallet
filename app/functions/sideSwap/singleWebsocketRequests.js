import {getSideSwapApiUrl} from './sideSwapEndpoitns';

function sideSwapSingleRquest(requestData) {
  const endpoint = getSideSwapApiUrl(process.env.BOLTZ_ENVIRONMENT);
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(endpoint);

    ws.onopen = () => {
      // Send the request as soon as the connection is open
      ws.send(JSON.stringify(requestData));
    };

    ws.onmessage = event => {
      // Resolve the promise with the received response
      resolve(JSON.parse(event.data)?.result);
      ws.close();
    };

    ws.onerror = error => {
      reject(error);
      ws.close();
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  });
}

export default sideSwapSingleRquest;
