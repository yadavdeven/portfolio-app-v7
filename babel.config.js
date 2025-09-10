// babel.config.js
const envFile = process.env.ENVFILE || '.env';

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: envFile,
        allowUndefined: true,
      },
    ],
    'react-native-worklets/plugin',
  ],
};
