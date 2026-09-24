// 引擎类型定义（零 RN 依赖）

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type RotState = 0 | 1 | 2 | 3;

/** 棋盘单元格：0 = 空，否则为已锁定方块的类型 */
export type Cell = PieceType | 0;

/** 完整棋盘：(ROWS + BUFFER) × COLS，上方 BUFFER 行为隐形生成区 */
export type Board = Cell[][];

export interface Piece {
  type: PieceType;
  /** 形状矩阵，元素 0/1（I 为 4×4，O 为 2×2，其余 3×3） */
  matrix: number[][];
  /** 矩阵左上角在棋盘上的列坐标 */
  x: number;
  /** 矩阵左上角在棋盘上的行坐标（含 BUFFER 偏移；可见区从 BUFFER 行开始） */
  y: number;
  /** 旋转状态：0=出生 1=顺时针90° 2=180° 3=270° */
  rot: RotState;
}

export type Command = 'left' | 'right' | 'rotate' | 'softDrop' | 'hardDrop';

export type Phase = 'ready' | 'playing' | 'paused' | 'over';

/** 引擎事件：update/dispatch 的返回值，供渲染层驱动动画与音效 */
export type EngineEvent =
  | { type: 'locked'; clearedRows: number[]; gained: number }
  | { type: 'hardDropped'; cells: number }
  | { type: 'levelUp'; level: number }
  | { type: 'over' };

/** 供 Zustand store 消费的快照 */
export interface Snapshot {
  board: Board;
  current: Piece | null;
  next: PieceType[];
  score: number;
  level: number;
  lines: number;
  phase: Phase;
}
