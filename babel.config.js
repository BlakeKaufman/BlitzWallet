module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module:react-native-dotenv'],
    // [
    //   'transform-inline-environment-variables',
    //   {
    //     include: ['GL_CUSTOM_NOBODY_CERT', 'GL_CUSTOM_NOBODY_KEY', 'API_KEY'],
    //   },
    // ],
    [
      'module-resolver',
      {
        alias: {
          crypto: 'react-native-quick-crypto',
          stream: 'stream-browserify',
          buffer: '@craftzdog/react-native-buffer',
        },
      },
    ],
  ],
};
