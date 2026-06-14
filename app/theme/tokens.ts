/**
 * Echo — Design Tokens
 *
 * The visual DNA of Echo. Dark-first, luminous accents,
 * designed to feel premium and alive.
 */

// ─── Color Palette ───────────────────────────────────────────

export const Colors = {
  // Base darks — deep, rich backgrounds
  background: {
    primary: '#0A0A1A',    // near-black with blue undertone
    secondary: '#12122A',  // slightly lifted
    tertiary: '#1A1A3A',   // card surfaces
    elevated: '#22224A',   // modals, overlays
  },

  // Text
  text: {
    primary: '#F0F0FF',    // warm white
    secondary: '#9090B8',  // muted lavender
    tertiary: '#606088',   // subtle labels
    inverse: '#0A0A1A',   // for light surfaces
  },

  // World accent colors — each world has its signature glow
  worlds: {
    ripple: {
      primary: '#00E5FF',    // vivid cyan
      secondary: '#0088AA',  // deep teal
      glow: '#00E5FF40',     // cyan glow (25% opacity)
      gradient: ['#001A2E', '#003344', '#00E5FF'] as [string, string, string],
    },
    shadow: {
      primary: '#A855F7',    // vivid purple
      secondary: '#6B21A8',  // deep violet
      glow: '#A855F740',     // purple glow
      gradient: ['#1A0A2E', '#2D1566', '#A855F7'] as [string, string, string],
    },
    heat: {
      primary: '#FF8C00',    // vivid amber
      secondary: '#CC5500',  // burnt orange
      glow: '#FF8C0040',     // amber glow
      gradient: ['#2E1A00', '#663300', '#FF8C00'] as [string, string, string],
    },
  },

  // UI accents
  accent: {
    success: '#22C55E',  // green — correct guess
    warning: '#EAB308',  // yellow — close guess
    error: '#EF4444',    // red — wrong guess
    info: '#3B82F6',     // blue — hints
  },

  // Stars
  star: {
    filled: '#FFD700',   // gold
    empty: '#2A2A4A',    // dark outline
    glow: '#FFD70060',   // gold shimmer
  },

  // Borders & dividers
  border: {
    subtle: '#FFFFFF08',  // barely visible
    default: '#FFFFFF12', // subtle
    strong: '#FFFFFF20',  // visible
  },

  // Overlays
  overlay: {
    light: '#FFFFFF05',
    medium: '#FFFFFF10',
    heavy: '#00000080',
  },
} as const;

// ─── Typography ──────────────────────────────────────────────

export const Typography = {
  fonts: {
    display: 'System', // Will use SF Pro Display on iOS
    body: 'System',    // Will use SF Pro Text on iOS
    mono: 'Menlo',     // Monospace for numbers/stats
  },

  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 40,
    hero: 56,
  },

  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  lineHeights: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.4,
    relaxed: 1.6,
  },

  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1.0,
    display: -1.5, // tight tracking for large display text
  },
} as const;

// ─── Spacing ─────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
} as const;

// ─── Border Radius ───────────────────────────────────────────

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 999,
} as const;

// ─── Shadows ─────────────────────────────────────────────────

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 0,
  }),
} as const;

// ─── World Configs ───────────────────────────────────────────

import type { WorldConfig } from '@/app/types';

export const WORLD_CONFIGS: Record<string, WorldConfig> = {
  ripple: {
    id: 'ripple',
    name: 'Ripple',
    emoji: '🌊',
    description: 'Locate hidden sources by analyzing expanding wave patterns.',
    totalLevels: 10, // V1.0 scope
    unlockRequirement: 0, // available from start
    accentColor: Colors.worlds.ripple.primary,
    gradientColors: Colors.worlds.ripple.gradient,
    inputType: 'touch',
  },
  shadow: {
    id: 'shadow',
    name: 'Shadow',
    emoji: '🌑',
    description: 'Identify hidden shapes from projected silhouettes.',
    totalLevels: 10,
    unlockRequirement: 10, // need 10 stars to unlock
    accentColor: Colors.worlds.shadow.primary,
    gradientColors: Colors.worlds.shadow.gradient,
    inputType: 'touch',
  },
  heat: {
    id: 'heat',
    name: 'Heat',
    emoji: '🌡️',
    description: 'Analyze thermal gradients to locate hidden heat sources.',
    totalLevels: 10,
    unlockRequirement: 20, // need 20 stars to unlock
    accentColor: Colors.worlds.heat.primary,
    gradientColors: Colors.worlds.heat.gradient,
    inputType: 'touch',
  },
};

export const WORLD_ORDER: string[] = ['ripple', 'shadow', 'heat'];
