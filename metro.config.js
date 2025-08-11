const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add custom resolver to handle @ alias
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
};

// Ensure @ alias works during bundling
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;