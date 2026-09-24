// 碰撞检测 —— 所有操作（移动/旋转/下落/硬降）的唯一闸门
import { COLS, TOTAL_ROWS } from './constants';
import type { Board, Piece } from './types';

/**
 * 判定方块在棋盘上是否碰撞。
 * 规则：
 * - 左右越界、底越界 → 碰撞
 * - 与棋盘已有方块重叠 → 碰撞
 * - 上方（by < 0）允许溢出（生成区语义），不检查棋盘占用
 */
export function collides(board: Board, piece: Piece): boolean {
  const m = piece.matrix;
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (!m[y][x]) continue;
      const by = piece.y + y;
      const bx = piece.x + x;
      if (bx < 0 || bx >= COLS || by >= TOTAL_ROWS) return true;
      if (by >= 0 && board[by][bx] !== 0) return true;
    }
  }
  return false;
}
