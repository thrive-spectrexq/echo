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
  | 'world_unlock'
  | 'ambient';

// ─── Audio Manager ───────────────────────────────────────────

class AudioManagerClass {
  private ambientSound: Audio.Sound | null = null;
  private soundEffects: Record<string, Audio.Sound> = {};
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Map of audio assets (these will fail gracefully if files don't exist yet)
      const assets: Partial<Record<SoundEffect, any>> = {
        level_complete: require('@/assets/audio/success.mp3'),
        guess_miss: require('@/assets/audio/fail.mp3'),
        hint: require('@/assets/audio/hint.mp3'),
        ambient: require('@/assets/audio/ambient.mp3'),
      };

      for (const [key, module] of Object.entries(assets)) {
        try {
          const { sound } = await Audio.Sound.createAsync(module as any);
          this.soundEffects[key] = sound;
        } catch (e) {
          console.warn(`[AudioManager] Missing audio asset: ${key}.mp3`);
        }
      }

      this.ambientSound = this.soundEffects['ambient'] || null;
      if (this.ambientSound) {
        await this.ambientSound.setIsLoopingAsync(true);
      }

      this.isInitialized = true;
    } catch (error) {
      console.warn('[AudioManager] Failed to initialize:', error);
    }
  }

  async playSoundEffect(effect: SoundEffect) {
    if (!this.isInitialized) await this.init();
    
    const settings = useSettingsStore.getState().settings;
    if (!settings.soundEnabled) return;

    const sound = this.soundEffects[effect];
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (e) {
        // Ignore playback errors
      }
    }
  }

  async playAmbient() {
    if (!this.isInitialized) await this.init();
    
    const settings = useSettingsStore.getState().settings;
    if (!settings.soundEnabled) return;

    if (this.ambientSound) {
      try {
        await this.ambientSound.playAsync();
      } catch (e) {}
    }
  }

  async stopAmbient() {
    if (this.ambientSound) {
      try {
        await this.ambientSound.pauseAsync();
      } catch (e) {}
    }
  }

  async cleanup() {
    for (const key in this.soundEffects) {
      await this.soundEffects[key].unloadAsync();
    }
    this.soundEffects = {};
    this.ambientSound = null;
    this.isInitialized = false;
  }
}

export const AudioManager = new AudioManagerClass();
