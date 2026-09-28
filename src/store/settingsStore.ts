// 设置 store：幽灵方块开关 + 手势灵敏度（AsyncStorage 持久化）
import { create } from 'zustand';
import { loadSettings, saveSettings } from '../utils/storage';

export type Sensitivity = 'low' | 'medium' | 'high';

interface SettingsState {
  ghostEnabled: boolean;
  sensitivity: Sensitivity;
  /** App 启动时从磁盘加载完成 */
  loaded: boolean;
  setGhostEnabled: (enabled: boolean) => void;
  setSensitivity: (s: Sensitivity) => void;
  load: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ghostEnabled: true,
  sensitivity: 'medium',
  loaded: false,

  setGhostEnabled: (ghostEnabled) => {
    set({ ghostEnabled });
    void saveSettings({ ghostEnabled, sensitivity: get().sensitivity });
  },

  setSensitivity: (sensitivity) => {
    set({ sensitivity });
    void saveSettings({ ghostEnabled: get().ghostEnabled, sensitivity });
  },

  load: async () => {
    const stored = await loadSettings();
    set({
      ghostEnabled: stored?.ghostEnabled ?? true,
      sensitivity: stored?.sensitivity ?? 'medium',
      loaded: true,
    });
  },
}));
