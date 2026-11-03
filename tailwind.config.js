const { colors, fontFamily, fontSize, borderRadius, boxShadow } = require('./theme/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Rack is light-only; 'class' stops NativeWind's web runtime from throwing on color-scheme changes.
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  // Values live in theme/tokens.js (from Figma variables). Use <Text weight="medium"> rather than font-* classes.
  theme: {
    extend: { colors, fontFamily, fontSize, borderRadius, boxShadow },
  },
  plugins: [],
};
