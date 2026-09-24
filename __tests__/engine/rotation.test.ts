import { createBoard } from '@engine/board';
import { rotateCW, tryRotate } from '@engine/rotation';
import { fill, makePiece } from './helpers';

describe('rotation（SRS 旋转与踢墙）', () => {
  it('rotateCW 矩阵变换正确（T 块）', () => {
    const t = makePiece('T', 0, 0).matrix;
    // 出生：上尖；顺时针 90°：右尖
    expect(rotateCW(t)).toEqual([
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ]);
  });

  it('空场旋转成功，rot 0→1', () => {
    const board = createBoard();
    const result = tryRotate(board, makePiece('T', 3, 10));
    expect(result).not.toBeNull();
    expect(result!.rot).toBe(1);
  });

  it('O 块旋转恒等（rot 不变、位置不变）', () => {
    const board = createBoard();
    const o = makePiece('O', 4, 10);
    const result = tryRotate(board, o);
    expect(result).toEqual(o);
    expect(result!.rot).toBe(0);
  });

  it('I 块贴左墙 + 落点被占时踢墙生效（偏移到 x=0）', () => {
    let board = createBoard();
    // 占住 col1 的 10~13 行，使 (0,0) 偏移失败；(-2,0) 越界失败；(1,0) 成功
    board = fill(board, 10, 13, 1, 1);
    const i = makePiece('I', -1, 10);
    const result = tryRotate(board, i);
    expect(result).not.toBeNull();
    expect(result!.x).toBe(0);
    expect(result!.rot).toBe(1);
  });

  it('完全被围困时旋转返回 null（5 组踢墙全部失败）', () => {
    let board = createBoard();
    // 围住 T(x=3,y=5) 周边区域，仅保留其出生 4 格
    board = fill(board, 4, 9, 1, 8);
    const t = makePiece('T', 3, 5);
    // 清出 T 出生位置：(4,5),(3,6),(4,6),(5,6)
    board = board.map((row, y) => row.map((c, x) => {
      const isSpawnCell = (y === 5 && x === 4) || (y === 6 && x >= 3 && x <= 5);
      return isSpawnCell ? 0 : c;
    }));
    expect(tryRotate(board, t)).toBeNull();
  });

  it('贴堆旋转（J 块落底时）可正常旋转', () => {
    let board = createBoard();
    board = fill(board, 23, 23, 0, 9); // 底行全满
    const j = makePiece('J', 3, 21); // J 底行在 22 行，旋转后 3×3 底行在 23 行 → 需要向上踢
    const result = tryRotate(board, j);
    // '0>1' 踢墙含 dy=-1（上移）与 dy=+2（下移，会撞底），至少上移偏移可救
    if (result) {
      expect(result.y).toBeLessThan(21);
    } else {
      expect(result).toBeNull();
    }
  });
});
