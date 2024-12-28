import crypto from 'react-native-quick-crypto';
export default function customUUID() {
  try {
    const preimage = crypto.randomBytes(32);
    return crypto
      .createHash('sha256')
      .update(preimage)
      .update(JSON.stringify(new Date().getTime()))
      .digest()
      .toString('hex')
      .slice(0, 16);
  } catch (err) {
    console.log(err);
    return false;
  }
}
