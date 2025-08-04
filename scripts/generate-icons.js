const fs = require('fs');
const path = require('path');

// This script helps generate different icon sizes
// You'll need to manually convert the SVG to PNG using online tools or design software
// Required sizes for React Native/Expo:

const iconSizes = {
  // iOS sizes
  'icon-20.png': 20,
  'icon-20@2x.png': 40,
  'icon-20@3x.png': 60,
  'icon-29.png': 29,
  'icon-29@2x.png': 58,
  'icon-29@3x.png': 87,
  'icon-40.png': 40,
  'icon-40@2x.png': 80,
  'icon-40@3x.png': 120,
  'icon-60@2x.png': 120,
  'icon-60@3x.png': 180,
  'icon-76.png': 76,
  'icon-76@2x.png': 152,
  'icon-83.5@2x.png': 167,
  'icon-1024.png': 1024,
  
  // Android sizes
  'icon-48.png': 48,
  'icon-72.png': 72,
  'icon-96.png': 96,
  'icon-144.png': 144,
  'icon-192.png': 192,
  'icon-512.png': 512,
  
  // Common sizes
  'icon.png': 1024,
  'adaptive-icon.png': 1024
};

console.log('Icon sizes needed:');
console.log(JSON.stringify(iconSizes, null, 2));
console.log('\nPlease convert the app-icon.svg to these PNG sizes and place them in assets/images/');
console.log('You can use online tools like:\n- https://www.iloveimg.com/resize-image\n- https://imageresizer.com/');