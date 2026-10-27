/** @type {import('tailwindcss').Config} */
module.exports = {
  // Rack is light-only; 'class' stops NativeWind's web runtime from throwing on color-scheme changes.
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#09090b',
        muted: '#71717a',
        inverse: '#f3f4f6',
        surface: '#ffffff',
        strong: '#e4e4e7',
        line: '#e4e4e7',
        primary: {
          DEFAULT: '#18181b',
          hover: '#27272a',
        },
        card: '#f4f4f5',
        danger: '#dc2626',
      },
      // RN has no font-weight to family mapping, so each weight is its own family.
      // Use <Text weight="medium"> from components/ui/Text rather than these classes directly.
      fontFamily: {
        sans: ['CabinetGrotesk-Regular'],
        'sans-medium': ['CabinetGrotesk-Medium'],
        'sans-bold': ['CabinetGrotesk-Bold'],
      },
      fontSize: {
        lg: ['18px', { lineHeight: '30px' }],
      },
      borderRadius: {
        md: '6px',
      },
      boxShadow: {
        sm: '0 1px 2px #1018280D',
        'sm-strong': '0 1px 3px #1018281A, 0 1px 2px -1px #0000001A',
      },
    },
  },
  plugins: [],
};
