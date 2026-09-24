// Board：可见区棋盘（View 矩阵）+ 当前方块 + 幽灵方块 三层叠加
import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { BUFFER, COLS, ROWS } from '@engine/constants';
import { useGameStore } from '../store/gameStore';
import { BOARD_BORDER, CELL_EMPTY, PIECE_COLORS } from './colors';

interface OverlayCell {
  key: string;
  x: number;
  y: number;
  color: string;
  ghost: boolean;
}

export function Board() {
  const board = useGameStore((s) => s.board);
  const current = useGameStore((s) => s.current);
  const ghostY = useGameStore((s) => s.ghostY);
  const { width, height } = useWindowDimensions();

  // 自适应格子尺寸：为左右面板各留 ~120pt、上下留 ~120pt
  const cell = Math.max(
    12,
    Math.floor(Math.min((width - 260) / COLS, (height - 220) / ROWS)),
  );

  const visible = useMemo(() => board.slice(BUFFER, BUFFER + ROWS), [board]);

  const overlay = useMemo<OverlayCell[]>(() => {
    if (!current) return [];
    const cells: OverlayCell[] = [];
    current.matrix.forEach((row, dy) => {
      row.forEach((v, dx) => {
        if (!v) return;
        const by = current.y + dy - BUFFER; // 转为可见区坐标
        if (by >= 0) {
          cells.push({ key: `c${dy}-${dx}`, x: current.x + dx, y: by, color: PIECE_COLORS[current.type], ghost: false });
        }
        if (ghostY != null) {
          const gy = ghostY + dy - BUFFER;
          if (gy >= 0 && gy !== by) {
            cells.push({ key: `g${dy}-${dx}`, x: current.x + dx, y: gy, color: PIECE_COLORS[current.type], ghost: true });
          }
        }
      });
    });
    return cells;
  }, [current, ghostY]);

  return (
    <View style={[styles.frame, { width: COLS * cell + 2, height: ROWS * cell + 2 }]}>
      {visible.map((row, y) =>
        row.map((c, x) => (
          <View
            key={`b${x}-${y}`}
            style={[
              styles.cell,
              {
                left: x * cell + 1,
                top: y * cell + 1,
                width: cell - 1,
                height: cell - 1,
                backgroundColor: c ? PIECE_COLORS[c] : CELL_EMPTY,
              },
            ]}
          />
        )),
      )}
      {overlay.map((o) => (
        <View
          key={o.key}
          style={[
            styles.cell,
            {
              left: o.x * cell + 1,
              top: o.y * cell + 1,
              width: cell - 1,
              height: cell - 1,
              backgroundColor: o.color,
              opacity: o.ghost ? 0.3 : 1,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'center',
    backgroundColor: CELL_EMPTY,
    borderColor: BOARD_BORDER,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cell: {
    position: 'absolute',
    borderRadius: 2,
  },
});
