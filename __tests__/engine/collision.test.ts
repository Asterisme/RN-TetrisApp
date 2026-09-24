import { createBoard } from '@engine/board';
import { COLS, TOTAL_ROWS } from '@engine/constants';
import { collides } from '@engine/collision';
import { fill, makePiece } from './helpers';

describe('collision（碰撞检测唯一闸门）', () => {
  it('空场中央不碰撞', () => {
    const board = createBoard();
    expect(collides(board, makePiece('T', 3, 10))).toBe(false);
  });

  it('左墙越界碰撞', () => {
    const board = createBoard();
    expect(collides(board, makePiece('J', -1, 10))).toBe(true);
  });

  it('右墙越界碰撞', () => {
    const board = createBoard();
    expect(collides(board, makePiece('T', 8, 10))).toBe(true);
  });

  it('底越界碰撞', () => {
    const board = createBoard();
    expect(collides(board, makePiece('J', 3, TOTAL_ROWS - 1))).toBe(true);
  });

  it('与棋盘已有方块堆叠碰撞', () => {
    let board = createBoard();
    board = fill(board, 15, 15, 0, COLS - 1);
    // J 的底行（矩阵第 1 行）落在第 15 行
    expect(collides(board, makePiece('J', 3, 14))).toBe(true);
    // 上移一格不碰
    expect(collides(board, makePiece('J', 3, 13))).toBe(false);
  });

  it('上方（by<0）允许溢出，不判碰撞', () => {
    const board = createBoard();
    expect(collides(board, makePiece('T', 3, -2))).toBe(false);
  });

  it('O 块贴右墙可放置（x=8：列 8、9 合法）', () => {
    const board = createBoard();
    expect(collides(board, makePiece('O', 8, 10))).toBe(false);
    expect(collides(board, makePiece('O', 9, 10))).toBe(true);
  });
});
