import { SevenBag } from '@engine/bag';
import { PIECE_TYPES } from '@engine/constants';
import { mulberry32 } from './helpers';

describe('SevenBag（7-bag 随机生成）', () => {
  it('任意连续 7 块恰好包含全部 7 种（验证前两袋）', () => {
    const bag = new SevenBag();
    const first = Array.from({ length: 7 }, () => bag.next());
    const second = Array.from({ length: 7 }, () => bag.next());
    for (const t of PIECE_TYPES) {
      expect(first.filter((x) => x === t)).toHaveLength(1);
      expect(second.filter((x) => x === t)).toHaveLength(1);
    }
  });

  it('连续 14 块 = 两轮完整 7 种', () => {
    const bag = new SevenBag();
    const pieces = Array.from({ length: 14 }, () => bag.next());
    const counts = new Map(pieces.map((p) => [p, pieces.filter((x) => x === p).length]));
    for (const t of PIECE_TYPES) expect(counts.get(t)).toBe(2);
  });

  it('peek(n) 预览与后续 next 一致，且不消耗队列', () => {
    const bag = new SevenBag();
    const preview = bag.peek(3);
    expect(preview).toHaveLength(3);
    expect(bag.peek(3)).toEqual(preview); // 不消耗
    const taken = Array.from({ length: 3 }, () => bag.next());
    expect(taken).toEqual(preview);
  });

  it('注入固定种子 rng 时结果可复现', () => {
    const a = Array.from({ length: 14 }, () => new SevenBag(mulberry32(42)).next()).join('');
    const b = Array.from({ length: 14 }, () => new SevenBag(mulberry32(42)).next()).join('');
    expect(a).toBe(b);
  });
});
