import * as Clipboard from 'expo-clipboard';

export default async function copyToClipboard(data, navigate) {
  try {
    await Clipboard.setStringAsync(data);
    navigate.navigate('ClipboardCopyPopup', {didCopy: true});
    return;

    // Alert.alert('Text Copied to Clipboard');
  } catch (err) {
    navigate.navigate('ClipboardCopyPopup', {didCopy: false});
    // Alert.alert('ERROR WITH COPYING');
  }
}
