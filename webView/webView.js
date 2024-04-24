export const webViewHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
  </head>
  <body>
  </body>
  <script>

  async function createMusig(data){
   
    window.ReactNativeWebView.postMessage(data)
  }

</script>
</html>
`;
