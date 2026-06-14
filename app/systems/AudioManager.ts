/**
 * Echo — Audio Manager
 *
 * Manages ambient soundscapes, sound effects, and
 * world-specific audio. Uses expo-av.
 */

import { Audio } from 'expo-av';
import { useSettingsStore } from '@/app/store';

// ─── Sound Effect Types ──────────────────────────────────────

export type SoundEffect =
  | 'tap'
  | 'ripple'
  | 'guess_hit'
  | 'guess_miss'
  | 'guess_close'
  | 'hint'
  | 'star_earn'
  | 'level_complete'
  | 'world_unlock';

// ─── Audio Manager ───────────────────────────────────────────

class AudioManagerClass {
  private sounds: Map<string, Audio.Sound> = new Map();
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    this.isInitialized = true;
  }

  async play(effect: SoundEffect) {
    const settings = useSettingsStore.getState().settings;
    if (!settings.soundEnabled) return;

    // TODO: Load and play actual sound files from assets/sounds/
    // For now, this is a no-op until audio assets are added.
    // Example:
    // const { sound } = await Audio.Sound.createAsync(
    //   require('@/assets/sounds/tap.mp3'),
    //   { volume: settings.soundVolume }
    // );
    // await sound.playAsync();
    // this.sounds.set(effect, sound);
  }

  async cleanup() {
    for (const [, sound] of this.sounds) {
      await sound.unloadAsync();
    }
    this.sounds.clear();
  }
}

export const AudioManager = new AudioManagerClass();
