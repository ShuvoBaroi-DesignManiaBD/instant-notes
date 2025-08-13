// const { getDefaultConfig } = require('expo/metro-config');
// const path = require('path');

// const config = getDefaultConfig(__dirname);

// // Add custom resolver to handle @ alias
// config.resolver.alias = {
//   '@': path.resolve(__dirname, './'),
// };

// // Ensure @ alias works during bundling
// config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// module.exports = config;


const {
  getDefaultConfig
} = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add WASM support and handle SQLite web issues
config.resolver.assetExts.push('wasm');

// Handle SQLite web platform issues
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add platform-specific resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Handle the SQLite WASM module issue for web
config.resolver.alias = {
  ...config.resolver.alias,
  // Provide a fallback for SQLite on web
  'expo-sqlite': require.resolve('expo-sqlite'),
};

// Exclude problematic modules on web
config.resolver.blockList = [
  // Block SQLite WASM files that cause issues
  /.*\/wa-sqlite\/wa-sqlite\.wasm$/,
];

module.exports = config;