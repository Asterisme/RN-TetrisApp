// 测试公共工具
import { SHAPES, COLS, TOTAL_ROWS } from '@engine/constants';
import type { Board, Cell, Piece, PieceType } from '@engine/types';

export function makePiece(type: PieceType, x: number, y: number): Piece {
  return { type, matrix: SHAPES[type].map((r) => [...r]), x, y, rot: 0 };
}

/** 在棋盘上填充指定行区间、列区间的格子 */
export function fill(
  board: Board,
  rowFrom: number,
  rowTo: number,
  colFrom: number,
  colTo: number,
  value: Cell = 'J',
): Board {
  const next = board.map((r) => r.slice());
  for (let y = rowFrom; y <= rowTo; y++) {
    for (let x = colFrom; x <= colTo; x++) {
      next[y][x] = value;
    }
  }
  return next;
}

/** 填满整行 */
export function fillRow(board: Board, row: number, except: number[] = []): Board {
  const next = board.map((r) => r.slice());
  for (let x = 0; x < COLS; x++) {
    if (!except.includes(x)) next[row][x] = 'J';
  }
  return next;
}

/** mulberry32 伪随机数生成器（可复现测试用） */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const TOTAL = TOTAL_ROWS;
