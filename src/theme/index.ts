export const colors = {
  background: '#F6F6F1',
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1ED',
  border: '#E6E8E2',
  borderStrong: '#D8DED8',

  goldLight: '#FFBF6D',
  gold: '#F5A94E',
  goldDeep: '#ED9636',
  goldMuted: '#FFF0DE',

  teal: '#154F59',
  tealDark: '#0E4049',
  tealMuted: '#E1ECEB',
  peach: '#FFF0DF',
  peachStrong: '#FFE1C2',

  textPrimary: '#173F45',
  textSecondary: '#667C7D',
  textMuted: '#9AA8A7',
  onGold: '#FFFFFF',

  success: '#3E9A78',
  successMuted: '#E4F3EC',
  warning: '#E69436',
  warningMuted: '#FFF0DC',
  danger: '#D7655B',
  dangerMuted: '#FBE9E7',
  info: '#4E8292',
  infoMuted: '#E3EFF2',
} as const;

export const gradients = {
  gold: [colors.goldLight, colors.goldDeep] as const,
  goldSubtle: ['#FFF1DF', '#FFF8EF'] as const,
  backgroundGlow: ['#FFFFFF', '#F6F6F1'] as const,
};

export const spacing = {
  xs: 4,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
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

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.7 },
  h1: { fontSize: 25, fontWeight: '700' as const, letterSpacing: -0.4 },
  h2: { fontSize: 19, fontWeight: '700' as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.7 },
} as const;

export const shadow = {
  gold: {
    shadowColor: '#D98D32',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  card: {
    shadowColor: '#526B6E',
    shadowOpacity: 0.09,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
};
