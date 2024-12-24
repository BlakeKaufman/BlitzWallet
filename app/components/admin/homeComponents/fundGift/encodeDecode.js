// import {Buffer} from 'buffer';
// import {TextDecoder, TextEncoder} from 'util';

// // Function to derive a key from a password
// function deriveKey(password, salt, iterations, keyLen) {
//   return new Promise(resolve => {
//     const textEncoder = new TextEncoder();
//     const passwordBytes = textEncoder.encode(password);
//     const saltBytes = textEncoder.encode(salt);

//     let key = passwordBytes;
//     for (let i = 0; i < iterations; i++) {
//       key = sha256(new Uint8Array([...key, ...saltBytes]));
//     }

//     resolve(key.slice(0, keyLen));
//   });
// }
// // SHA-256 hash function
// function sha256(data) {
//   const textDecoder = new TextDecoder();
//   const buffer = new Uint8Array(data);
//   const hexString = Array.prototype.map
//     .call(buffer, byte => ('0' + byte.toString(16)).slice(-2))
//     .join('');
//   const hashBuffer = new Buffer.from(hexString, 'hex');
//   return new Uint8Array(hashBuffer);
// }

// // Function to XOR encode/decode data
// function xorEncodeDecode(input, key) {
//   try {
//     const inputChars = Array.from(input);
//     const outputChars = [];
//     console.log(inputChars.length);
//     for (let i = 0; i < inputChars.length; i++) {
//       const inputCharCode = inputChars[i].charCodeAt(0);
//       const keyCharCode = key[i % key.length];
//       const outputCharCode = inputCharCode ^ keyCharCode;
//       outputChars.push(String.fromCharCode(outputCharCode));
//     }

//     return outputChars.join('');
//   } catch (err) {
//     console.log(err);
//   }
// }

// export {xorEncodeDecode, deriveKey};
