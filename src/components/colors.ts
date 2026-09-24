// 方块配色（渲染层唯一配色来源）
import type { PieceType } from '@engine/types';

export const PIECE_COLORS: Record<PieceType, string> = {
  I: '#22d3ee',
  O: '#facc15',
  T: '#a855f7',
  S: '#22c55e',
  Z: '#ef4444',
  J: '#3b82f6',
  L: '#f97316',
};

export const CELL_EMPTY = '#111827';
export const BOARD_BORDER = '#374151';
export const SCREEN_BG = '#0b1220';
export const TEXT_MAIN = '#e5e7eb';
export const TEXT_DIM = '#9ca3af';
