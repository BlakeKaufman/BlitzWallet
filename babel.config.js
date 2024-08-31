module.exports = api => {
  const isProduction = api.env('production');

  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      ['module:react-native-dotenv'],
      ['react-native-reanimated/plugin'],
      isProduction && ['transform-remove-console'],
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
    ].filter(Boolean),
  };
};
