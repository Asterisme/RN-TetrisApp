import { COLS, ROWS, BUFFER } from '@engine/constants';

describe('engine smoke', () => {
  it('棋盘尺寸为标准 10×20，含 4 行生成区缓冲', () => {
    expect(COLS).toBe(10);
    expect(ROWS).toBe(20);
    expect(BUFFER).toBe(4);
  });
});
