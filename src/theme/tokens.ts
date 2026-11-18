// Design system derivado de ui-ux-pro-max: Flat Design para app de productividad.
// Paleta teal + acento naranja, contraste AA (>= 4.5:1), sin gradientes ni sombras.
export const colors = {
  primary: '#0F766E',        // teal oscuro: 4.8:1 sobre blanco
  primaryStrong: '#115E59',
  primarySoft: '#CCFBF1',
  primarySurface: '#F0FDFA',
  accent: '#EA580C',         // naranja para CTA / foco
  accentSoft: '#FFF7ED',
  background: '#F0FDFA',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',
  foreground: '#134E4A',
  text: '#1E293B',
  textMuted: '#475569',
  textSubtle: '#64748B',
  border: '#99F6E4',
  borderSoft: '#E2E8F0',
  destructive: '#DC2626',
  destructiveSoft: '#FEF2F2',
  warning: '#B45309',
  warningSoft: '#FFFBEB',
  success: '#0D9488',
  onPrimary: '#FFFFFF',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const type = {
  eyebrow: { fontSize: 11, fontWeight: '800' as const, letterSpacing: 1.4 },
  heading: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.5 },
  section: { fontSize: 12, fontWeight: '800' as const, letterSpacing: 1 },
  body: { fontSize: 14, lineHeight: 21 },
  caption: { fontSize: 12, lineHeight: 17 },
  stat: { fontSize: 24, fontWeight: '800' as const },
} as const;

export const touch = {
  minTarget: 44,      // 44pt iOS / 48dp Android
  hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
} as const;
