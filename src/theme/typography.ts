import { TextStyle } from 'react-native';

export const fonts = {
  sans: 'Outfit',
  serif: 'Newsreader',
} as const;

export const type: Record<string, TextStyle> = {
  eyebrow: {
    fontFamily: fonts.sans,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: '#787774',
  },
  display: {
    fontFamily: fonts.serif,
    fontSize: 38,
    fontWeight: '500',
    letterSpacing: -1.2,
    lineHeight: 42,
  },
  title: {
    fontFamily: fonts.sans,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  mono: {
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  stat: {
    fontFamily: fonts.serif,
    fontSize: 28,
    fontWeight: '500',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
};
