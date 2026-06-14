/**
 * Echo — Haptics Manager
 *
 * Contextual haptic feedback system.
 * Respects user settings for enabled/intensity.
 */

import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/app/store';

export type HapticEvent =
  | 'tap'
  | 'guess_hit'
  | 'guess_miss'
  | 'guess_close'
  | 'hint'
  | 'star'
  | 'level_complete'
  | 'world_unlock'
  | 'proximity_low'
  | 'proximity_medium'
  | 'proximity_high';

const hapticMap: Record<HapticEvent, () => Promise<void>> = {
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  guess_hit: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  guess_miss: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  guess_close: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  hint: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  star: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  level_complete: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  world_unlock: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  proximity_low: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  proximity_medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  proximity_high: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
};

export async function triggerHaptic(event: HapticEvent): Promise<void> {
  const settings = useSettingsStore.getState().settings;
  if (!settings.hapticsEnabled) return;

  try {
    await hapticMap[event]();
  } catch {
    // Haptics not available (simulator, etc.)
  }
}
