import * as crypto from 'react-native-quick-crypto';

export default function sha256Hash(hashString) {
  try {
    return crypto.default
      .createHash('sha256')
      .update(hashString)
      .digest()
      .toString('hex');
  } catch (err) {
    console.log(err);
    return false;
  }
}
