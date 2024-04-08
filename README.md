<img src="/app/assets/wordmark.png" alt="Project Logo" width="100%">

<hr/>

Blitz Wallet is a React Native application that allows users to interact with the Bitcoin Lighting Network in a self-custodial way. Combining Breez, Boltz, Blockstream, and Nostr, Blitz Wallet aims to create a seamless and simple payment experience for its users.

<hr>

⚠️ This is a SELF-CUSTODIAL Bitcoin Lightning wallet. Neither Blitz, Boltz, or Blockstream has access to your seed phrase or funds. If you lose your seed phrase, access to your funds will be lost. Also, do not share your seed phrase with anyone. If you do, they will be able to steal your funds.

## Features

- Send Bitcoin payments
  - From QR code
  - From camera roll
  - From clipboard
  - From contacts (Coming soon...)
- Receive Bitcoin payments
  - Using a Unified QR code
  - Using a Lightning QR code
  - Using a Bitcoin QR Code
  - Using a Liquid QR Code
- LNURL pay, withdrawal, and auth support
- Wallet recovery
- Support for numerous fiat currencies
- Export transactions in a CSV file
- View a detailed description of payments (date, time fee, payment type) + technical details (payment hash, payment preimage, payment ID)
- Change balance denomination between Fiat, Sats, or hidden
- Toggle the inbound liquidity indicator to see how many sets you have left to receive before a user needs to open a new channel
- Faucet
  - Send faucet (giveaway)
     - Ability to send an LNURL withdrawal to multiple users and the amount will be pulled from your account
  - Receive faucet (collection)
     - Ability to collect money from many users without having to manually create new invoices
- Opt-in Biometric login
- Gains Calculator
- Dark mode and Light mode
- Easy left slide QR code scanning on the wallet page

## TODO

- [ ] Migrate from local storage to Google Firebase
- [ ] Finish LNURL pay faucet
- [ ] Contacts
- [ ] Ability to merge accounts if the user has two or more accounts
- [ ] Translation option
- [ ] Keep track of failed transactions
- [ ] Be able to send to a Bitcoin address from Lightning balance and also a Liquid address from Lightning balance
- [ ] Gift wallet feature
- [ ] Savings account option
- [ ] Suggested words when restoring the wallet
- [ ] migrate from expo 49 to 50
- [ ] Split bill option in contacts


## Contribute

We rely on GitHub for bug tracking. Before reporting a new bug, please take a moment to search the <a href='https://github.com/BlakeKaufman/BlitzWallet/issues'>existing issues</a> to see if your problem has already been addressed. If you can't find an existing report, feel free to create a new issue.

Moreover, we encourage contributions to the project by submitting pull requests to improve the codebase or introduce new features. All pull requests will be thoroughly reviewed by members of the Blitz team. Your contributions are invaluable to us!

## Build

To run the project locally, follow these steps:

Set Environment Variables

```
// .env
API_KEY = **** //Breez API KEY
GL_CUSTOM_NOBODY_CERT= **** //Blockstream greenlight certificate
GL_CUSTOM_NOBODY_KEY= **** //Blockstream greenlight key
PROJECT_ID = ****
```

Clone this repository to your local machine:

```bash
git clone <repository-url>
```
Navigate to the project directory:

```bash
cd blitzWallet
```

Install dependencies using npm or yarn:

```bash
npm install
# or
yarn install
```

Install pods 

```bash
cd ios
pod install
```

Run bundler <a href='https://reactnative.dev/docs/metro'>Metro</a>

```bash
npm start -- --reset-cache
```

Run the application on an Android or iOS emulator or device:

```bash
react-native run-android
# or
react-native run-ios
```

## License
Blitz is released under the terms of the Apache 2.0 license. See LICENSE for more information.
