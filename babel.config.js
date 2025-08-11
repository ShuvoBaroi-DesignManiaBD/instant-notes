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
      // Keep Expo Router Babel plugin if you decide to add it later:
      // 'expo-router/babel',
    ],
  };
};