/**
 * Echo — Settings Store
 *
 * User preferences persisted via MMKV for instant access.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
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
  subscribeWithSelector((set) => ({
    settings: { ...defaultSettings },
    isLoaded: false,

    updateSetting: (key, value) => {
      set((state) => ({
        settings: { ...state.settings, [key]: value },
      }));
      // TODO: persist to MMKV
    },

    loadSettings: (partial) => {
      set((state) => ({
        settings: { ...defaultSettings, ...partial },
        isLoaded: true,
      }));
    },

    resetSettings: () => {
      set({
        settings: { ...defaultSettings },
      });
      // TODO: clear MMKV
    },
  }))
);
