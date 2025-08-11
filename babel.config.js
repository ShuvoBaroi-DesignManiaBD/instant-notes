module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Enable @ alias imports like `import x from '@/utils/x'`
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
          },
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        },
      ],
      // Expo Router plugin is required when using expo-router/entry
      'expo-router/babel',
    ],
  };
};