import { clearLines, createBoard, lockPiece } from '@engine/board';
import { COLS, TOTAL_ROWS } from '@engine/constants';
import { dropInterval, lineScore, nextLevel } from '@engine/scoring';
import { fill, makePiece } from './helpers';

describe('board（锁定与消行）', () => {
  it('lockPiece 写入正确位置且不修改原棋盘（不可变）', () => {
    const board = createBoard();
    const snapshot = JSON.stringify(board);
    const t = makePiece('T', 3, 10);
    const next = lockPiece(board, t);
    expect(JSON.stringify(board)).toBe(snapshot); // 原棋盘不变
    expect(next[10][4]).toBe('T');
    expect(next[11][3]).toBe('T');
    expect(next[11][4]).toBe('T');
    expect(next[11][5]).toBe('T');
    expect(next[10][3]).toBe(0);
  });

  it('clearLines：0 行时返回原棋盘引用', () => {
    let board = createBoard();
    board = fill(board, 15, 15, 0, 5);
    const result = clearLines(board);
    expect(result.board).toBe(board);
    expect(result.clearedRows).toEqual([]);
  });

  it('clearLines：单行消除 + 顶部补空行', () => {
    let board = createBoard();
    board = fill(board, 22, 22, 0, 9); // 底行满
    board[10][0] = 'T';
    const { board: next, clearedRows } = clearLines(board);
    expect(clearedRows).toEqual([22]);
    expect(next[TOTAL_ROWS - 1].every((c) => c === 0)).toBe(true);
    expect(next[11][0]).toBe('T'); // 原 10 行内容下移到 11 行
  });

  it('clearLines：双行消除', () => {
    let board = createBoard();
    board = fill(board, 22, 23, 0, 9);
    const { board: next, clearedRows } = clearLines(board);
    expect(clearedRows).toEqual([22, 23]);
    expect(next.length).toBe(TOTAL_ROWS);
    expect(next.every((r) => r.every((c) => c === 0))).toBe(true);
  });

  it('clearLines：非连续行（第 5、8 行满）同时消除', () => {
    let board = createBoard();
    board = fill(board, 5, 5, 0, 9);
    board = fill(board, 8, 8, 0, 9);
    board[6][0] = 'T';
    const { board: next, clearedRows } = clearLines(board);
    expect(clearedRows).toEqual([5, 8]);
    // 原 6 行的 T 应在新的 7 行位置
    expect(next[7][0]).toBe('T');
    expect(next[TOTAL_ROWS - 1].every((c) => c === 0)).toBe(true);
  });

  it('clearLines：四行消除（Tetris）', () => {
    let board = createBoard();
    board = fill(board, 20, 23, 0, 9);
    const { clearedRows } = clearLines(board);
    expect(clearedRows).toEqual([20, 21, 22, 23]);
  });
});

describe('scoring（计分与等级曲线）', () => {
  it.each([
    [1, 100], [2, 300], [3, 500], [4, 800],
  ])('%i 行得分基数为 %i', (cleared, base) => {
    expect(lineScore(cleared, 1)).toBe(base);
  });

  it('得分随等级倍增', () => {
    expect(lineScore(4, 3)).toBe(2400);
  });

  it('0 行不得分', () => {
    expect(lineScore(0, 5)).toBe(0);
  });

  it('dropInterval 随等级递减且下限 60ms', () => {
    expect(dropInterval(1)).toBe(1000);
    expect(dropInterval(2)).toBe(920);
    expect(dropInterval(12)).toBe(120);
    expect(dropInterval(13)).toBe(60);
    expect(dropInterval(20)).toBe(60);
  });

  it('nextLevel 每 10 行升 1 级', () => {
    expect(nextLevel(0)).toBe(1);
    expect(nextLevel(9)).toBe(1);
    expect(nextLevel(10)).toBe(2);
    expect(nextLevel(25)).toBe(3);
  });
});
