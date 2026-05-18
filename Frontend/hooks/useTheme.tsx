import React, { createContext, useContext, useState } from 'react';
import { COLORS } from '../constants/theme';

// theme object matching old screens that use theme.text, theme.bg etc.
const DARK_THEME = {
  bg: '#0A0A0F', bgCard: '#141420', bgCard2: '#1A1A2E',
  border: '#2A2A40', borderLight: '#333350',
  text: '#FFFFFF', textSub: '#B0B0CC', textMuted: '#6B6B88',
  tabBar: '#0F0F1A', header: '#0F0F1A', input: '#1E1E2E',
};
const LIGHT_THEME = {
  bg: '#F0F4FF', bgCard: '#FFFFFF', bgCard2: '#EEF2FF',
  border: '#E0E6FF', borderLight: '#C8D3FF',
  text: '#1A1A2E', textSub: '#4A4A6A', textMuted: '#8888AA',
  tabBar: '#FFFFFF', header: '#FFFFFF', input: '#F0F4FF',
};

// colors object matching old screens that use colors.gold, colors.teal etc.
const BRAND_COLORS = {
  gold: '#F5A623', goldDark: '#E6940F', goldLight: '#F7C060',
  teal: '#00BCD4', tealDark: '#0097A7', tealLight: '#4DD0E1',
  blue: '#1E88E5', success: '#4CAF50', error: '#F44336',
  warning: '#FF9800', purple: '#9C27B0', pink: '#E91E63',
};

// gradients matching old screens
const GRADIENTS = {
  gold: ['#F5A623', '#F7C060'],
  goldDark: ['#E6940F', '#C8780A'],
  teal: ['#00BCD4', '#0097A7'],
  tealBlue: ['#00BCD4', '#1565C0'],
  darkCard: ['#141420', '#1A1A2E'],
  lightCard: ['#FFFFFF', '#F0F4FF'],
  success: ['#4CAF50', '#2E7D32'],
  error: ['#F44336', '#C62828'],
  blue: ['#1E88E5', '#1565C0'],
};

interface ThemeCtx {
  isDark: boolean;
  toggleTheme: () => void;
  theme: typeof DARK_THEME;
  colors: typeof BRAND_COLORS;
  gradients: typeof GRADIENTS;
  C: typeof COLORS;
  accent: string;
}

const Ctx = createContext<ThemeCtx>({
  isDark: true, toggleTheme: () => {},
  theme: DARK_THEME, colors: BRAND_COLORS, gradients: GRADIENTS,
  C: COLORS, accent: '#F5A623',
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? DARK_THEME : LIGHT_THEME;
  return (
    <Ctx.Provider value={{ isDark, toggleTheme: () => setIsDark(d => !d), theme, colors: BRAND_COLORS, gradients: GRADIENTS, C: COLORS, accent: isDark ? '#F5A623' : '#00BCD4' }}>
      {children}
    </Ctx.Provider>
  );
};

export const useTheme = () => useContext(Ctx);

// Convenience hook used by new screens
export const useColors = () => {
  const { isDark, theme } = useTheme();
  return {
    bg: theme.bg, card: theme.bgCard, card2: theme.bgCard2,
    border: theme.border, text: theme.text, sub: theme.textSub,
    muted: theme.textMuted, isDark,
    C: COLORS,
  };
};















// import React, { createContext, useContext, useState } from 'react';

// /* ─────────────────────────────
//    CORE DARK THEME (STABLE)
// ───────────────────────────── */

// const DARK_THEME = {
//   background: '#0E0F14',
//   surface: '#151823',
//   surfaceAlt: '#1B1F2A',

//   border: '#2A2F3A',
//   borderSoft: '#333949',

//   textPrimary: '#FFFFFF',
//   textSecondary: '#B5B9C6',
//   textMuted: '#7A8191',

//   input: '#1A1E2A',
//   header: '#121521',
//   tabBar: '#121521',
// };

// /* ─────────────────────────────
//    CORE LIGHT THEME (CLEAN HRMS)
// ───────────────────────────── */

// const LIGHT_THEME = {
//   background: '#F7F8FA',
//   surface: '#FFFFFF',
//   surfaceAlt: '#F1F3F7',

//   border: '#D9DEE7',
//   borderSoft: '#E5E9F0',

//   textPrimary: '#1A1D23',
//   textSecondary: '#4A5568',
//   textMuted: '#6B7280',

//   input: '#F3F5F8',
//   header: '#FFFFFF',
//   tabBar: '#FFFFFF',
// };

// /* ─────────────────────────────
//    MINIMAL BRAND COLORS (NO NOISE)
// ───────────────────────────── */

// const BRAND = {
//   primary: '#2F3A8F',   // corporate blue (stable)
//   accent: '#B8860B',    // muted gold (very limited use)

//   success: '#2E7D32',
//   error: '#C62828',
//   warning: '#B26A00',
//   info: '#1E5AA8',
// };

// /* ─────────────────────────────
//    CONTEXT TYPE
// ───────────────────────────── */

// interface ThemeContextType {
//   isDark: boolean;
//   toggleTheme: () => void;

//   theme: typeof DARK_THEME;
//   brand: typeof BRAND;

//   accent: string;
// }

// /* ─────────────────────────────
//    CONTEXT
// ───────────────────────────── */

// const ThemeContext = createContext<ThemeContextType>({
//   isDark: true,
//   toggleTheme: () => {},

//   theme: DARK_THEME,
//   brand: BRAND,

//   accent: BRAND.primary,
// });

// /* ─────────────────────────────
//    PROVIDER
// ───────────────────────────── */

// export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
//   const [isDark, setIsDark] = useState(true);

//   const theme = isDark ? DARK_THEME : LIGHT_THEME;

//   return (
//     <ThemeContext.Provider
//       value={{
//         isDark,
//         toggleTheme: () => setIsDark(prev => !prev),

//         theme,
//         brand: BRAND,

//         // fixed accent (no dynamic switching chaos)
//         accent: BRAND.primary,
//       }}
//     >
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// /* ─────────────────────────────
//    HOOK
// ───────────────────────────── */

// export const useTheme = () => useContext(ThemeContext);

// /* ─────────────────────────────
//    SIMPLE COLOR ACCESS (CLEAN)
// ───────────────────────────── */

// export const useColors = () => {
//   const { isDark, theme, brand } = useTheme();

//   return {
//     isDark,

//     bg: theme.background,
//     card: theme.surface,
//     card2: theme.surfaceAlt,

//     border: theme.border,
//     borderSoft: theme.borderSoft,

//     text: theme.textPrimary,
//     sub: theme.textSecondary,
//     muted: theme.textMuted,

//     input: theme.input,
//     header: theme.header,
//     tabBar: theme.tabBar,

//     // fixed corporate brand (no variation chaos)
//     C: brand,
//     accent: brand.primary,
//   };
// };












// import React, { createContext, useContext, useState } from 'react';
// import { COLORS } from '../constants/theme';

// /* ─────────────────────────────
//    CORE THEME TOKENS (DARK/LIGHT)
// ───────────────────────────── */

// const DARK_THEME = {
//   background: '#0B1220',
//   surface: '#141A2A',
//   surfaceAlt: '#1A2235',

//   border: '#273044',
//   borderSoft: '#2F3A52',

//   textPrimary: '#FFFFFF',
//   textSecondary: '#B0B7D0',
//   textMuted: '#6B7394',

//   input: '#1A2235',
//   header: '#0F172A',
//   tabBar: '#0F172A',
// };

// const LIGHT_THEME = {
//   background: '#F6F8FC',
//   surface: '#FFFFFF',
//   surfaceAlt: '#EEF2FF',

//   border: '#E3E8F5',
//   borderSoft: '#CBD5E1',

//   textPrimary: '#0F172A',
//   textSecondary: '#334155',
//   textMuted: '#64748B',

//   input: '#F1F5F9',
//   header: '#FFFFFF',
//   tabBar: '#FFFFFF',
// };

// /* ─────────────────────────────
//    BRAND TOKENS (GLOBAL SYSTEM)
// ───────────────────────────── */

// const BRAND = {
//   primary: '#4F46E5',
//   primaryDark: '#4338CA',
//   primaryLight: '#6366F1',

//   accent: '#F5A623',
//   accentSoft: 'rgba(245,166,35,0.15)',

//   teal: '#06B6D4',
//   success: '#16A34A',
//   error: '#DC2626',
//   warning: '#F59E0B',
//   info: '#2563EB',
// };

// /* ─────────────────────────────
//    GRADIENT SYSTEM (SOFT SaaS STYLE)
// ───────────────────────────── */

// const GRADIENTS = {
//   primary: ['#4F46E5', '#6366F1'],
//   accent: ['#F5A623', '#FBBF24'],

//   success: ['#16A34A', '#22C55E'],
//   error: ['#DC2626', '#EF4444'],

//   dark: ['#0B1220', '#141A2A'],
//   light: ['#FFFFFF', '#F6F8FC'],
// };

// /* ─────────────────────────────
//    TYPES
// ───────────────────────────── */

// interface ThemeContextType {
//   isDark: boolean;
//   toggleTheme: () => void;

//   theme: typeof DARK_THEME;
//   brand: typeof BRAND;
//   gradients: typeof GRADIENTS;

//   accent: string;
// }

// /* ─────────────────────────────
//    CONTEXT
// ───────────────────────────── */

// const ThemeContext = createContext<ThemeContextType>({
//   isDark: true,
//   toggleTheme: () => {},

//   theme: DARK_THEME,
//   brand: BRAND,
//   gradients: GRADIENTS,

//   accent: BRAND.accent,
// });

// /* ─────────────────────────────
//    PROVIDER
// ───────────────────────────── */

// export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
//   const [isDark, setIsDark] = useState(true);

//   const theme = isDark ? DARK_THEME : LIGHT_THEME;

//   return (
//     <ThemeContext.Provider
//       value={{
//         isDark,
//         toggleTheme: () => setIsDark(prev => !prev),

//         theme,
//         brand: BRAND,
//         gradients: GRADIENTS,

//         accent: isDark ? BRAND.accent : BRAND.teal,
//       }}
//     >
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// /* ─────────────────────────────
//    MAIN HOOK
// ───────────────────────────── */

// export const useTheme = () => useContext(ThemeContext);

// /* ─────────────────────────────
//    CONVENIENCE HOOK (UI FRIENDLY)
// ───────────────────────────── */

// export const useColors = () => {
//   const { isDark, theme, brand } = useTheme();

//   return {
//     isDark,

//     // semantic UI tokens (BEST PRACTICE)
//     bg: theme.background,
//     card: theme.surface,
//     card2: theme.surfaceAlt,

//     border: theme.border,
//     borderSoft: theme.borderSoft,

//     text: theme.textPrimary,
//     sub: theme.textSecondary,
//     muted: theme.textMuted,

//     input: theme.input,
//     header: theme.header,
//     tabBar: theme.tabBar,

//     // brand system
//     C: brand,

//     // convenience accent
//     accent: isDark ? brand.accent : brand.teal,
//   };
// };