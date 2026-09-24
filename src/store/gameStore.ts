// Zustand 状态桥：只存快照数据，引擎实例在 store 外（src/store/engine.ts）
import { create } from 'zustand';
import type { Snapshot } from '@engine/types';

interface GameState extends Snapshot {
  /** 幽灵方块落点 y（棋盘全坐标，渲染时减 BUFFER） */
  ghostY: number | null;
  /** 本地最高分（Phase 4 接 AsyncStorage 持久化） */
  highScore: number;
  setSnapshot: (snapshot: Snapshot, ghostY: number | null) => void;
  setHighScore: (score: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  board: [],
  current: null,
  next: [],
  score: 0,
  level: 1,
  lines: 0,
  phase: 'ready',
  ghostY: null,
  highScore: 0,
  setSnapshot: (snapshot, ghostY) => set({ ...snapshot, ghostY }),
  setHighScore: (highScore) => set({ highScore }),
}));
