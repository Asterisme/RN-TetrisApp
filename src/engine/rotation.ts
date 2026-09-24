// SRS 旋转系统：矩阵顺时针旋转 + 踢墙偏移尝试
import { KICKS_I, KICKS_JLSTZ } from './constants';
import { collides } from './collision';
import type { Board, Piece, RotState } from './types';

/** 矩阵顺时针旋转 90°：newGrid[y][x] = old[N-1-x][y] */
export function rotateCW(m: number[][]): number[][] {
  const n = m.length;
  return m.map((row, y) => row.map((_, x) => m[n - 1 - x][y]));
}

/**
 * 尝试顺时针旋转：旋转矩阵后按 SRS 踢墙表逐个偏移试探，
 * 第一个合法位置生效；全部失败返回 null（旋转无效）。
 * O 块旋转恒等（2×2 对称矩阵转置不变）。
 */
export function tryRotate(board: Board, piece: Piece): Piece | null {
  if (piece.type === 'O') return { ...piece };

  const matrix = rotateCW(piece.matrix);
  const rot = ((piece.rot + 1) % 4) as RotState;
  const table = piece.type === 'I' ? KICKS_I : KICKS_JLSTZ;
  const kicks = table[`${piece.rot}>${rot}`];

  for (const [dx, dy] of kicks) {
    const candidate: Piece = { ...piece, matrix, rot, x: piece.x + dx, y: piece.y + dy };
    if (!collides(board, candidate)) return candidate;
  }
  return null;
}
