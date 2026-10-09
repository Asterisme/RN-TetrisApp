// Zustand 状态桥：只存快照数据，引擎实例在 store 外（src/store/engine.ts）
import { create } from 'zustand';
import type { Piece, Snapshot } from '@engine/types';

interface GameState extends Snapshot {
  /** 幽灵方块落点 y（棋盘全坐标，渲染时减 BUFFER） */
  ghostY: number | null;
  /** 本地最高分（Phase 4 接 AsyncStorage 持久化） */
  highScore: number;
  /** 消行动画：rows 为可见区行号，token 每次消行递增以重触发动画 */
  clearing: { rows: number[]; token: number } | null;
  /** 锁块闪白：被锁定方块的位置，token 递增重触发 */
  lockFlash: { piece: Piece; token: number } | null;
  setSnapshot: (snapshot: Snapshot, ghostY: number | null) => void;
  setHighScore: (score: number) => void;
  setClearing: (c: { rows: number[]; token: number } | null) => void;
  setLockFlash: (f: { piece: Piece; token: number } | null) => void;
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
  clearing: null,
  lockFlash: null,
  setSnapshot: (snapshot, ghostY) => set({ ...snapshot, ghostY }),
  setHighScore: (highScore) => set({ highScore }),
  setClearing: (clearing) => set({ clearing }),
  setLockFlash: (lockFlash) => set({ lockFlash }),
}));
