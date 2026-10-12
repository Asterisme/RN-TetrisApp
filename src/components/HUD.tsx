// HUD：紧凑横排（分数/等级/行数/最高分），字段级精确订阅，数字变化不引起棋盘重渲染
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
      <Stat label="LV" value={level} />
      <Stat label="LINES" value={lines} />
      <Stat label="BEST" value={Math.max(highScore, score)} />
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  stat: {
    gap: 1,
  },
  label: {
    color: TEXT_DIM,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  value: {
    color: TEXT_MAIN,
    fontSize: 15,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
});
