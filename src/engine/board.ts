// 棋盘操作：创建 / 锁定 / 消行（全部不可变，返回新棋盘）
import { COLS, TOTAL_ROWS } from './constants';
import type { Board, Cell, Piece } from './types';

export function createBoard(): Board {
  return Array.from({ length: TOTAL_ROWS }, () => Array<Cell>(COLS).fill(0));
}

/** 将方块写入棋盘（不可变：返回新棋盘，越界单元格静默忽略） */
export function lockPiece(board: Board, piece: Piece): Board {
  const next = board.map((row) => row.slice());
  piece.matrix.forEach((row, dy) => {
    row.forEach((v, dx) => {
      if (!v) return;
      const by = piece.y + dy;
      if (by >= 0 && by < TOTAL_ROWS) next[by][piece.x + dx] = piece.type;
    });
  });
  return next;
}

/**
 * 消除满行：filter 掉满行 + 顶部补等量空行。
 * clearedRows 记录的是消行前棋盘中的原始行号，供渲染层播放闪烁动画。
 */
export function clearLines(board: Board): { board: Board; clearedRows: number[] } {
  const clearedRows: number[] = [];
  board.forEach((row, i) => {
    if (row.every((c) => c !== 0)) clearedRows.push(i);
  });
  if (clearedRows.length === 0) return { board, clearedRows };

  const kept = board.filter((_, i) => !clearedRows.includes(i));
  const empty = Array.from({ length: clearedRows.length }, () => Array<Cell>(COLS).fill(0));
  return { board: [...empty, ...kept], clearedRows };
}
