// 配色（渲染层唯一配色来源）：方块色 + 掌机机身/LCD 主题
import type { PieceType } from '@engine/types';

export const PIECE_COLORS: Record<PieceType, string> = {
  I: '#22d3ee',
  O: '#facc15',
  T: '#a855f7',
  S: '#22c55e',
  Z: '#ef4444',
  J: '#3b82f6',
  L: '#f97316',
};

// 掌机主题（参照经典掌机俄罗斯方块）
export const SHELL_BG = '#f7c948'; // 机身黄
export const SHELL_SHADOW = 'rgba(120, 90, 0, 0.35)'; // 机身按钮投影
export const SHELL_TEXT = '#6b4f00'; // 机身上的文字（深棕）
export const SHELL_DOTS = '#8a6a00'; // 标题装饰点线
export const LCD_FRAME = '#2f3640'; // LCD 外框（深灰黑）
export const LCD_BG = '#a8bd85'; // LCD 底色（绿）
export const CELL_EMPTY = '#97ac74'; // LCD 空格（比底色深一档，形成格栅）
export const LCD_TEXT = '#31412a'; // LCD 文字（深绿黑）
export const LCD_MINI_BG = '#8da368'; // LCD 统计栏缩略底
export const BTN_BLUE = '#2f5fd0'; // 动作键（蓝）
export const BTN_BLUE_BORDER = '#6b8fe8';
export const BTN_GREEN = '#1f9d3f'; // 功能键（绿）
export const BTN_GREEN_BORDER = '#4bd06a';
export const BTN_RED = '#d32f2f'; // 重玩键（红）
export const BTN_RED_BORDER = '#ff6b6b';
export const BTN_CAPTION = '#5c4400'; // 键下标签（棕）

export const BOARD_BORDER = '#2f3640';
export const SCREEN_BG = '#f7c948';
export const TEXT_MAIN = '#e5e7eb';
export const TEXT_DIM = '#9ca3af';
