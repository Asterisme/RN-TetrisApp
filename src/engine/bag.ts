// 7-bag 随机生成器：每袋 7 种方块各一个，抽完才换新袋
import { PIECE_TYPES } from './constants';
import type { PieceType } from './types';

function shuffledBag(rng: () => number): PieceType[] {
  const bag = [...PIECE_TYPES];
  // Fisher-Yates 洗牌
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export class SevenBag {
  private queue: PieceType[] = [];

  /** rng 可注入：测试用固定种子保证可复现 */
  constructor(private rng: () => number = Math.random) {}

  /** 取下一个方块（消耗） */
  next(): PieceType {
    this.ensure(1);
    return this.queue.shift()!;
  }

  /** 预览接下来 n 个方块（不消耗） */
  peek(n: number): PieceType[] {
    this.ensure(n);
    return this.queue.slice(0, n);
  }

  private ensure(n: number): void {
    while (this.queue.length < n) {
      this.queue.push(...shuffledBag(this.rng));
    }
  }
}
