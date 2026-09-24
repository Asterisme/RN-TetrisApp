// HUD：分数 / 等级 / 行数 / 最高分（字段级精确订阅，数字变化不引起棋盘重渲染）
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { TEXT_DIM, TEXT_MAIN } from './colors';

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function HUD() {
  const score = useGameStore((s) => s.score);
  const level = useGameStore((s) => s.level);
  const lines = useGameStore((s) => s.lines);
  const highScore = useGameStore((s) => s.highScore);

  return (
    <View style={styles.hud}>
      <Stat label="SCORE" value={score} />
      <Stat label="LEVEL" value={level} />
      <Stat label="LINES" value={lines} />
      <Stat label="BEST" value={Math.max(highScore, score)} />
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    gap: 14,
    minWidth: 90,
  },
  stat: {
    gap: 2,
  },
  label: {
    color: TEXT_DIM,
    fontSize: 11,
    letterSpacing: 1,
  },
  value: {
    color: TEXT_MAIN,
    fontSize: 20,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
});
