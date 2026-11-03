// Rack design tokens, pulled from Figma variables (file gOTzlDJ0JiyyXJ7iennaUf, section 320:5746).
// Plain CommonJS so tailwind.config.js can require it; typed via tokens.d.ts.
// Do not invent values here. Every entry maps to a Figma variable named in the comment.

const colors = {
  ink: '#09090b', // color-text
  muted: '#71717a', // color-text-muted, color-icon-muted, color-text-placeholder
  inverse: '#f3f4f6', // color-text-inverse
  'inverse-icon': '#e5e7eb', // color-icon-invers
  surface: '#ffffff', // color-bg
  strong: '#e4e4e7', // color-bg-strong
  line: '#e4e4e7', // color-border
  primary: {
    DEFAULT: '#18181b', // color-bg-primary, color-icon-primary, color-border-primary
    hover: '#27272a', // color-text-primary-hover
  },
  card: '#f4f4f5', // not a Figma variable: zinc-100, matches the grey cards in the frames
  danger: '#dc2626', // color-icon-error, color-text-error
  disabled: '#a1a1aa', // color-icon-disabled, color-text-disabled
  interactive: '#2563eb', // color-icon-interactive
  info: '#eff6ff', // color-bg-info-muted
};

const fontFamily = {
  // RN has no weight to family mapping, so each weight is its own family.
  sans: ['CabinetGrotesk-Regular'],
  'sans-medium': ['CabinetGrotesk-Medium'],
  'sans-bold': ['CabinetGrotesk-Bold'],
};

// Tailwind's defaults, except lg: Figma text-lg is 18/30.
const fontSize = {
  lg: ['18px', { lineHeight: '30px' }],
};

// Figma Spacing/*: 0.5 = 2, sm/xs = 8, md = 12, 9 = 36. Use Tailwind's 4px scale.
const borderRadius = {
  md: '6px', // Radii/radius-button
};

const boxShadow = {
  sm: '0 1px 2px #1018280D', // Shadows/sm
  'sm-strong': '0 1px 3px #1018281A, 0 1px 2px -1px #0000001A', // Shadows/sm-strong
};

module.exports = { colors, fontFamily, fontSize, borderRadius, boxShadow };
