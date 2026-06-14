/**
 * Echo — Animation Presets
 *
 * Shared animation configurations for Reanimated.
 * Consistent motion language across the app.
 */

import {
  withSpring,
  withTiming,
  Easing,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';

// ─── Spring Configs ──────────────────────────────────────────

export const Springs = {
  /** Gentle, floaty — for ambient elements */
  gentle: {
    damping: 20,
    stiffness: 100,
    mass: 1,
  } satisfies WithSpringConfig,

  /** Snappy — for UI interactions */
  snappy: {
    damping: 15,
    stiffness: 200,
    mass: 0.8,
  } satisfies WithSpringConfig,

  /** Bouncy — for success/celebration animations */
  bouncy: {
    damping: 10,
    stiffness: 150,
    mass: 0.6,
  } satisfies WithSpringConfig,

  /** Heavy — for settling, appearing elements */
  heavy: {
    damping: 25,
    stiffness: 120,
    mass: 1.2,
  } satisfies WithSpringConfig,

  /** Responsive — for drag/follow interactions */
  responsive: {
    damping: 28,
    stiffness: 300,
    mass: 0.5,
  } satisfies WithSpringConfig,
} as const;

// ─── Timing Configs ──────────────────────────────────────────

export const Timings = {
  /** Fast — micro-interactions, 150ms */
  fast: {
    duration: 150,
    easing: Easing.out(Easing.cubic),
  } satisfies WithTimingConfig,

  /** Normal — standard transitions, 300ms */
  normal: {
    duration: 300,
    easing: Easing.inOut(Easing.cubic),
  } satisfies WithTimingConfig,

  /** Slow — dramatic reveals, 500ms */
  slow: {
    duration: 500,
    easing: Easing.inOut(Easing.cubic),
  } satisfies WithTimingConfig,

  /** Very slow — page transitions, 700ms */
  dramatic: {
    duration: 700,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  } satisfies WithTimingConfig,

  /** Linear — for continuous animations */
  linear: (duration: number): WithTimingConfig => ({
    duration,
    easing: Easing.linear,
  }),

  /** Ripple expand — specific to ripple animations */
  rippleExpand: {
    duration: 2000,
    easing: Easing.out(Easing.quad),
  } satisfies WithTimingConfig,
} as const;

// ─── Animation Durations ─────────────────────────────────────

export const Durations = {
  instant: 100,
  fast: 150,
  normal: 300,
  slow: 500,
  dramatic: 700,
  ripple: 2000,
  ambient: 3000,
} as const;

// ─── Preset Animation Helpers ────────────────────────────────

export const animate = {
  /** Spring to a value with snappy feel */
  snap: (value: number) => withSpring(value, Springs.snappy),

  /** Spring to a value with gentle feel */
  float: (value: number) => withSpring(value, Springs.gentle),

  /** Spring to a value with bounce */
  bounce: (value: number) => withSpring(value, Springs.bouncy),

  /** Timed fade */
  fade: (value: number, duration = Durations.normal) =>
    withTiming(value, { duration, easing: Easing.inOut(Easing.cubic) }),

  /** Scale pop */
  pop: (value: number) => withSpring(value, Springs.bouncy),
} as const;
