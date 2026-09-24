// NextPanel：接下来 3 个方块的缩略预览
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SHAPES } from '@engine/constants';
import { useGameStore } from '../store/gameStore';
import { BOARD_BORDER, CELL_EMPTY, PIECE_COLORS, TEXT_DIM } from './colors';

const MINI = 9; // 缩略格子尺寸

export function NextPanel() {
  const next = useGameStore((s) => s.next);

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>NEXT</Text>
      {next.map((type, i) => (
        <View key={`${type}-${i}`} style={styles.pieceBox}>
          {SHAPES[type].map((row, y) =>
            row.map((v, x) =>
              v ? (
                <View
                  key={`${x}-${y}`}
                  style={[styles.cell, { left: x * MINI, top: y * MINI, width: MINI - 1, height: MINI - 1, backgroundColor: PIECE_COLORS[type] }]}
                />
              ) : null,
            ),
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: TEXT_DIM,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
  },
  pieceBox: {
    width: 4 * MINI,
    height: 4 * MINI,
    backgroundColor: CELL_EMPTY,
    borderColor: BOARD_BORDER,
    borderWidth: 1,
    borderRadius: 4,
  },
  cell: {
    position: 'absolute',
    borderRadius: 1,
  },
});
