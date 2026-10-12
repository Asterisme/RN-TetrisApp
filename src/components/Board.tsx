// Board：可见区棋盘（View 矩阵）+ 当前方块 + 幽灵 + 消行闪烁 + 锁块闪白
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { BUFFER, COLS, ROWS } from '@engine/constants';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { CELL_EMPTY, LCD_BG, PIECE_COLORS } from './colors';

interface OverlayCell {
  key: string;
  x: number;
  y: number;
  color: string;
  ghost: boolean;
}

export function Board({ cell }: { cell: number }) {
  const board = useGameStore((s) => s.board);
  const current = useGameStore((s) => s.current);
  const ghostY = useGameStore((s) => s.ghostY);
  const phase = useGameStore((s) => s.phase);
  const clearing = useGameStore((s) => s.clearing);
  const lockFlash = useGameStore((s) => s.lockFlash);
  const ghostEnabled = useSettingsStore((s) => s.ghostEnabled);

  // ---- 消行闪烁：白色横条在对应行上闪两轮后归零（~195ms）----
  const clearAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!clearing || clearing.rows.length === 0) return;
    clearAnim.setValue(1);
    Animated.sequence([
      Animated.timing(clearAnim, { toValue: 0.1, duration: 70, useNativeDriver: true }),
      Animated.timing(clearAnim, { toValue: 0.9, duration: 55, useNativeDriver: true }),
      Animated.timing(clearAnim, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start(() => {
      // 动画结束：若无新一轮消行接管，清除状态让闪烁层卸载（避免残留半透明印记）
      const cur = useGameStore.getState().clearing;
      if (!cur || cur.token === clearing.token) {
        useGameStore.getState().setClearing(null);
      }
    });
  }, [clearing, clearAnim]);

  // ---- 锁块闪白：锁定方块位置白色叠加淡出（~120ms）----
  const flashAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!lockFlash) return;
    flashAnim.setValue(1);
    Animated.timing(flashAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start();
  }, [lockFlash, flashAnim]);

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
        if (ghostEnabled && ghostY != null) {
          const gy = ghostY + dy - BUFFER;
          if (gy >= 0 && gy !== by) {
            cells.push({ key: `g${dy}-${dx}`, x: current.x + dx, y: gy, color: PIECE_COLORS[current.type], ghost: true });
          }
        }
      });
    });
    return cells;
  }, [current, ghostY, ghostEnabled]);

  const flashCells = useMemo<OverlayCell[]>(() => {
    if (!lockFlash) return [];
    const cells: OverlayCell[] = [];
    lockFlash.piece.matrix.forEach((row, dy) => {
      row.forEach((v, dx) => {
        if (!v) return;
        const by = lockFlash.piece.y + dy - BUFFER;
        if (by >= 0) {
          cells.push({ key: `f${dy}-${dx}`, x: lockFlash.piece.x + dx, y: by, color: '#ffffff', ghost: false });
        }
      });
    });
    return cells;
  }, [lockFlash]);

  return (
    <View style={[styles.frame, { width: COLS * cell + 2, height: ROWS * cell + 2, opacity: phase === 'over' ? 0.5 : 1 }]}>
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
      {/* 锁块闪白层 */}
      {flashCells.length > 0 && (
        <Animated.View style={[styles.animLayer, { opacity: flashAnim }]} pointerEvents="none">
          {flashCells.map((o) => (
            <View
              key={o.key}
              style={[styles.cell, { left: o.x * cell + 1, top: o.y * cell + 1, width: cell - 1, height: cell - 1, backgroundColor: '#fff' }]}
            />
          ))}
        </Animated.View>
      )}
      {/* 消行闪烁层 */}
      {clearing && clearing.rows.length > 0 && (
        <Animated.View style={[styles.animLayer, { opacity: clearAnim }]} pointerEvents="none">
          {clearing.rows.map((y) => (
            <View
              key={`clear-${y}`}
              style={[styles.clearRow, { top: y * cell + 1, height: cell - 1 }]}
            />
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'center',
    backgroundColor: LCD_BG,
    overflow: 'hidden',
  },
  cell: {
    position: 'absolute',
    borderRadius: 2,
  },
  animLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  clearRow: {
    position: 'absolute',
    left: 1,
    right: 1,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
});
