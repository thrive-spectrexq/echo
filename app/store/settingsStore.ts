/**
 * Echo — Settings Store
 *
 * User preferences persisted via AsyncStorage for instant access.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings } from '@/app/types';

// ─── State ───────────────────────────────────────────────────

interface SettingsState {
  settings: AppSettings;
  isLoaded: boolean;
}

// ─── Actions ─────────────────────────────────────────────────

interface SettingsActions {
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  loadSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

// ─── Defaults ────────────────────────────────────────────────

const defaultSettings: AppSettings = {
  theme: 'dark',
  soundEnabled: true,
  soundVolume: 0.8,
  hapticsEnabled: true,
  hapticsIntensity: 'medium',
  reducedMotion: false,
  highContrast: false,
};

// ─── Store ───────────────────────────────────────────────────

export const useSettingsStore = create<SettingsStore>()(

    resetSettings: () => {
      set({
        settings: { ...defaultSettings },
      });
      // TODO: clear MMKV
    },
  }))
);
