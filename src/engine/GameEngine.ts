// 游戏引擎主体：状态机 + 命令处理 + 时间步进（零 RN 依赖，可 Node 环境单测）
import { SevenBag } from './bag';
import { clearLines, createBoard, lockPiece } from './board';
import { collides } from './collision';
import { BUFFER, SHAPES, SPAWN_X, SPAWN_Y } from './constants';
import { tryRotate } from './rotation';
import { dropInterval, lineScore, nextLevel } from './scoring';
import type { Board, Command, EngineEvent, Phase, Piece, Snapshot } from './types';

/**
 * 使用约定：
 * - update(dt) 只接收时间增量（外层 rAF 循环负责钳制 dt），引擎不感知 rAF；
 * - dispatch/update 随时可调，仅 phase==='playing' 时生效；
 * - 所有状态变更不可变（board 返回新引用），便于 Zustand 引用比较。
 */
export class GameEngine {
  phase: Phase = 'ready';
  board: Board = createBoard();
  current: Piece | null = null;
  score = 0;
  level = 1;
  lines = 0;

  private bag: SevenBag;
  private dropCounter = 0;

  /** rng 可注入，用于测试可复现 */
  constructor(rng?: () => number) {
    this.bag = new SevenBag(rng);
  }

  start(): EngineEvent[] {
    this.board = createBoard();
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.dropCounter = 0;
    this.phase = 'playing';
    if (!this.spawn()) return [{ type: 'over' }];
    return [];
  }

  pause(): void {
    if (this.phase === 'playing') this.phase = 'paused';
  }

  resume(): void {
    if (this.phase === 'paused') this.phase = 'playing';
  }

  reset(): void {
    this.phase = 'ready';
    this.board = createBoard();
    this.current = null;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.dropCounter = 0;
  }

  /** 处理输入命令；仅 playing 状态生效 */
  dispatch(cmd: Command): EngineEvent[] {
    if (this.phase !== 'playing' || !this.current) return [];
    const p = this.current;

    switch (cmd) {
      case 'left':
      case 'right': {
        const moved = { ...p, x: p.x + (cmd === 'left' ? -1 : 1) };
        if (!collides(this.board, moved)) this.current = moved;
        return [];
      }
      case 'rotate': {
        const rotated = tryRotate(this.board, p);
        if (rotated) this.current = rotated;
        return [];
      }
      case 'softDrop': {
        const moved = { ...p, y: p.y + 1 };
        if (!collides(this.board, moved)) {
          this.current = moved;
          this.score += 1;
          this.dropCounter = 0;
          return [];
        }
        return this.lockCurrent();
      }
      case 'hardDrop':
        return this.hardDrop();
    }
  }

  /** 时间步进：累计 dt，超过重力间隔则下落一格；dt 由外层钳制后传入 */
  update(dt: number): EngineEvent[] {
    if (this.phase !== 'playing' || !this.current) return [];
    this.dropCounter += dt;
    const events: EngineEvent[] = [];
    while (this.dropCounter >= dropInterval(this.level) && this.phase === 'playing' && this.current) {
      this.dropCounter -= dropInterval(this.level);
      events.push(...this.stepDown());
    }
    return events;
  }

  /** 幽灵方块落点 y 坐标（渲染层专用，不做游戏计算） */
  getGhostY(): number | null {
    if (!this.current) return null;
    let y = this.current.y;
    for (;;) {
      const moved = { ...this.current, y: y + 1 };
      if (collides(this.board, moved)) return y;
      y = moved.y;
    }
  }

  getSnapshot(): Snapshot {
    return {
      board: this.board,
      current: this.current,
      next: this.bag.peek(3),
      score: this.score,
      level: this.level,
      lines: this.lines,
      phase: this.phase,
    };
  }

  // ---- 内部实现 ----

  private stepDown(): EngineEvent[] {
    const p = this.current!;
    const moved = { ...p, y: p.y + 1 };
    if (!collides(this.board, moved)) {
      this.current = moved;
      return [];
    }
    return this.lockCurrent();
  }

  private hardDrop(): EngineEvent[] {
    let cells = 0;
    for (;;) {
      const moved = { ...this.current!, y: this.current!.y + 1 };
      if (collides(this.board, moved)) break;
      this.current = moved;
      cells++;
    }
    this.score += cells * 2;
    return [{ type: 'hardDropped', cells }, ...this.lockCurrent()];
  }

  private lockCurrent(): EngineEvent[] {
    const p = this.current!;
    this.board = lockPiece(this.board, p);
    this.dropCounter = 0;

    // Lock-out：方块完全锁定在可见区上方 → 游戏结束
    const allAboveVisible = p.matrix.every((row, dy) =>
      row.every((v, dx) => !v || p.y + dy < BUFFER),
    );

    const { board, clearedRows } = clearLines(this.board);
    this.board = board;
    this.lines += clearedRows.length;
    const gained = lineScore(clearedRows.length, this.level);
    this.score += gained;

    const events: EngineEvent[] = [{ type: 'locked', clearedRows, gained }];
    const nl = nextLevel(this.lines);
    if (nl > this.level) {
      this.level = nl;
      events.push({ type: 'levelUp', level: nl });
    }

    if (allAboveVisible) {
      this.gameOver(events);
      return events;
    }
    if (!this.spawn()) this.gameOver(events);
    return events;
  }

  /** 生成新方块；生成即碰撞 → 游戏结束 */
  private spawn(): boolean {
    const type = this.bag.next();
    const piece: Piece = {
      type,
      matrix: SHAPES[type].map((r) => [...r]),
      x: SPAWN_X[type],
      y: SPAWN_Y,
      rot: 0,
    };
    if (collides(this.board, piece)) {
      this.current = null;
      this.phase = 'over';
      return false;
    }
    this.current = piece;
    return true;
  }

  private gameOver(events: EngineEvent[]): void {
    this.phase = 'over';
    this.current = null;
    events.push({ type: 'over' });
  }
}
