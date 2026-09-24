import { createBoard } from '@engine/board';
import { COLS, TOTAL_ROWS } from '@engine/constants';
import { GameEngine } from '@engine/GameEngine';
import { fill, fillRow, makePiece, mulberry32 } from './helpers';
import type { Command } from '@engine/types';

describe('GameEngine（状态机与命令）', () => {
  it('start → playing，当前方块与 next 预览就绪', () => {
    const engine = new GameEngine(mulberry32(42));
    expect(engine.start()).toEqual([]);
    expect(engine.phase).toBe('playing');
    expect(engine.current).not.toBeNull();
    expect(engine.getSnapshot().next).toHaveLength(3);
  });

  it('左右移动命令生效', () => {
    const engine = new GameEngine(mulberry32(42));
    engine.start();
    const x0 = engine.current!.x;
    engine.dispatch('left');
    expect(engine.current!.x).toBe(x0 - 1);
    engine.dispatch('right');
    expect(engine.current!.x).toBe(x0);
  });

  it('软降 +1 分并立即下落一格', () => {
    const engine = new GameEngine(mulberry32(42));
    engine.start();
    const y0 = engine.current!.y;
    engine.dispatch('softDrop');
    expect(engine.current!.y).toBe(y0 + 1);
    expect(engine.score).toBe(1);
  });

  it('update 超过重力间隔触发一格下落', () => {
    const engine = new GameEngine(mulberry32(42));
    engine.start();
    const y0 = engine.current!.y;
    engine.update(1000); // 1 级间隔恰为 1000ms
    expect(engine.current!.y).toBe(y0 + 1);
  });

  it('update 累计大 dt（多次锁定后棋盘有方块）', () => {
    const engine = new GameEngine(mulberry32(42));
    engine.start();
    for (let i = 0; i < 60; i++) engine.update(1000);
    const hasBlocks = engine.board.some((row) => row.some((c) => c !== 0));
    expect(hasBlocks).toBe(true);
  });

  it('硬降：计 2 分/格 + 立即锁定 + 消行', () => {
    const engine = new GameEngine(mulberry32(42));
    engine.start();
    engine.lines = 9; // 预置 9 行，消 1 行后升级
    engine.board = fillRow(engine.board, TOTAL_ROWS - 1, [8, 9]); // 底行留 8、9 两格
    engine.current = makePiece('O', 8, 0);
    const events = engine.dispatch('hardDrop');

    expect(engine.lines).toBe(10);
    expect(engine.level).toBe(2);
    expect(engine.score).toBe(22 * 2 + 100 * 1); // 硬降 44 + 消行 100
    expect(events.some((e) => e.type === 'hardDropped' && e.cells === 22)).toBe(true);
    expect(events.some((e) => e.type === 'locked' && e.clearedRows.length === 1)).toBe(true);
    expect(events.some((e) => e.type === 'levelUp' && e.level === 2)).toBe(true);
  });

  it('锁定后自动生成新方块', () => {
    const engine = new GameEngine(mulberry32(42));
    engine.start();
    const first = engine.current!.type;
    engine.dispatch('hardDrop');
    expect(engine.current).not.toBeNull();
    expect(engine.current!.type).not.toBe(first === 'O' ? '' : first);
  });

  it('游戏结束：堆满后硬降锁定 → 生成即碰撞 → over', () => {
    const engine = new GameEngine(mulberry32(42));
    engine.start();
    engine.board = fill(engine.board, 2, 5, 0, COLS - 1); // 生成区填满
    const events = engine.dispatch('hardDrop');
    expect(engine.phase).toBe('over');
    expect(engine.current).toBeNull();
    expect(events.some((e) => e.type === 'over')).toBe(true);
  });

  it('暂停时 dispatch 与 update 均无效，恢复后正常', () => {
    const engine = new GameEngine(mulberry32(42));
    engine.start();
    const y0 = engine.current!.y;
    engine.pause();
    expect(engine.dispatch('softDrop')).toEqual([]);
    expect(engine.update(5000)).toEqual([]);
    expect(engine.current!.y).toBe(y0);
    engine.resume();
    engine.update(1000);
    expect(engine.current!.y).toBe(y0 + 1);
  });

  it('reset 回到 ready 且棋盘清空', () => {
    const engine = new GameEngine(mulberry32(42));
    engine.start();
    engine.dispatch('hardDrop');
    engine.reset();
    expect(engine.phase).toBe('ready');
    expect(engine.board.every((r) => r.every((c) => c === 0))).toBe(true);
    expect(engine.current).toBeNull();
    expect(engine.score).toBe(0);
  });

  it('getGhostY 返回硬降落点（≥出生位）', () => {
    const engine = new GameEngine(mulberry32(42));
    engine.start();
    const ghostY = engine.getGhostY();
    expect(ghostY).not.toBeNull();
    expect(ghostY!).toBeGreaterThanOrEqual(engine.current!.y);
  });
});

describe('simulate（Node 环境模拟一局冒烟）', () => {
  it('500 次随机命令 + tick 推进，引擎状态自洽', () => {
    const rng = mulberry32(42);
    const engine = new GameEngine(rng);
    engine.start();
    const cmds: Command[] = ['left', 'right', 'rotate', 'softDrop', 'hardDrop'];
    let prevScore = 0;

    for (let i = 0; i < 500 && engine.phase !== 'over'; i++) {
      engine.dispatch(cmds[Math.floor(rng() * cmds.length)]);
      engine.update(50 + Math.floor(rng() * 100));

      // 不变量断言
      expect(engine.score).toBeGreaterThanOrEqual(prevScore);
      prevScore = engine.score;
      expect(engine.board.length).toBe(TOTAL_ROWS);
      expect(engine.board.every((r) => r.length === COLS)).toBe(true);
      expect(engine.board.every((r) => r.every((c) => c === 0 || typeof c === 'string'))).toBe(true);
    }
    expect(['playing', 'over']).toContain(engine.phase);
    if (engine.phase === 'over') expect(engine.current).toBeNull();
  });

  it('无命令自然下落直至游戏结束（或长程推进无崩溃）', () => {
    const engine = new GameEngine(mulberry32(7));
    engine.start();
    let iterations = 0;
    while (engine.phase !== 'over' && iterations < 20000) {
      engine.update(500);
      iterations++;
    }
    // 大多数种子下会自然堆满结束；即使没结束，棋盘也必须有已锁定的方块
    if (engine.phase === 'over') {
      expect(engine.current).toBeNull();
    } else {
      expect(engine.board.some((row) => row.some((c) => c !== 0))).toBe(true);
    }
  });
});
