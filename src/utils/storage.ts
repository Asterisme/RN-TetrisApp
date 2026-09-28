// AsyncStorage 封装：最高分 + 设置（读写失败静默降级，不阻塞游戏）
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Sensitivity } from '../store/settingsStore';

const KEYS = {
  highScore: '@tetris/highScore',
  settings: '@tetris/settings',
} as const;

export async function loadHighScore(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.highScore);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

export async function saveHighScore(score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.highScore, String(Math.floor(score)));
  } catch {
    // 存储失败只影响最高分显示，不阻塞游戏
  }
}

export interface StoredSettings {
  ghostEnabled: boolean;
  sensitivity: Sensitivity;
}

export async function loadSettings(): Promise<StoredSettings | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.settings);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSettings>;
    return {
      ghostEnabled: parsed.ghostEnabled ?? true,
      sensitivity: parsed.sensitivity === 'low' || parsed.sensitivity === 'high' ? parsed.sensitivity : 'medium',
    };
  } catch {
    return null;
  }
}

export async function saveSettings(settings: StoredSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
  } catch {
    // 同上：静默降级
  }
}
