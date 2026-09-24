// 计分与等级曲线
import { LINE_SCORE } from './constants';

/** 消行得分 = 基数(1/2/3/4 行) × 等级 */
export function lineScore(cleared: number, level: number): number {
  return LINE_SCORE[cleared] * level;
}

/** 重力下落间隔：随等级递减，下限 60ms */
export function dropInterval(level: number): number {
  return Math.max(60, 1000 - (level - 1) * 80);
}

/** 每 10 行升 1 级 */
export function nextLevel(lines: number): number {
  return Math.floor(lines / 10) + 1;
}
