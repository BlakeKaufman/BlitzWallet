import * as Clipboard from 'expo-clipboard';

export default async function copyToClipboard(data, navigate, page) {
  try {
    await Clipboard.setStringAsync(data);
    if (page === 'ChatGPT') return;
    navigate.navigate('ClipboardCopyPopup', {didCopy: true});
    return;

    // Alert.alert('Text Copied to Clipboard');
  } catch (err) {
    if (page === 'ChatGPT') return;
    navigate.navigate('ClipboardCopyPopup', {didCopy: false});
    // Alert.alert('ERROR WITH COPYING');
  }
}
