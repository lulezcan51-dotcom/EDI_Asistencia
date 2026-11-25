/**
 * Utilitarian editorial minimalism.
 * Color is scarce: warm monochrome + a single graphite accent.
 * No gradients, no decorative shadows, no emoji-as-icon.
 */
export const colors = {
  canvas: '#F7F6F3',
  surface: '#FFFFFF',
  surfaceAlt: '#FBFBFA',
  ink: '#1A1A19',
  inkSoft: '#343936',
  muted: '#787774',
  faint: '#A3A19D',
  line: '#EAEAEA',
  lineStrong: '#D9D7D2',
  accent: '#2F4858',
  accentSoft: '#E8ECEF',
  onAccent: '#FFFFFF',
  highBg: '#F6E8E6',
  highFg: '#8A3A32',
  midBg: '#F5EFDF',
  midFg: '#7A5C22',
  lowBg: '#E8EEE9',
  lowFg: '#41604A',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 12,
} as const;

export const touch = {
  minTarget: 44,
  hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
} as const;

export const layout = {
  maxWidth: 520,
  gutter: 20,
} as const;
