const { getDefaultConfig } = require('expo/metro-config');

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

// Optimization settings for production builds
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_keys: true,
      wrap_iife: true,
    },
    sourceMap: {
      includeSources: false,
    },
    toplevel: false,
    warnings: false,
  },
};

// Enable tree shaking and dead code elimination
config.resolver.unstable_enableSymlinks = false;
config.resolver.unstable_enablePackageExports = true;

// Exclude problematic modules on web
config.resolver.blockList = [
  // Block SQLite WASM files that cause issues
  /.*\/wa-sqlite\/wa-sqlite\.wasm$/,
];

module.exports = config;