import {sha256} from 'liquidjs-lib/src/crypto';

export default function sha256Hash(hashString) {
  try {
    return sha256(hashString).toString('hex');
  } catch (err) {
    console.log(err);
    return false;
  }
}
