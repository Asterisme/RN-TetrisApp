// 掌机外壳组件：机身两侧装饰方柱 + LCD 内统计栏 + 底部时钟/喇叭
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SHAPES } from '@engine/constants';
import { useGameStore } from '../store/gameStore';
import { LCD_MINI_BG, LCD_TEXT, PIECE_COLORS } from './colors';

const SQ = 7; // 装饰小方块尺寸
const GAP = 2;

/** 机身侧边装饰方柱（pattern 中每个子数组为一组，数字为该列方块数） */
export function DecorationColumn({ patterns }: { patterns: number[][] }) {
  return (
    <View style={styles.decoCol}>
      {patterns.map((cols, i) => (
        <View key={i} style={styles.decoGroup}>
          {cols.map((h, j) => (
            <View key={j} style={styles.decoStack}>
              {Array.from({ length: h }).map((_, k) => (
                <View key={k} style={styles.decoSquare} />
              ))}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** LCD 内右侧统计栏：最高分 / 分数 / 级别 / 下一个 */
export function LcdStatsPanel() {
  const score = useGameStore((s) => s.score);
  const level = useGameStore((s) => s.level);
  const highScore = useGameStore((s) => s.highScore);
  const next = useGameStore((s) => s.next);

  return (
    <View style={styles.stats}>
      <Text style={styles.statsLabel}>最高分</Text>
      <Text style={styles.statsDigits}>{String(Math.max(highScore, score)).padStart(6, '0')}</Text>
      <Text style={styles.statsLabel}>分数</Text>
      <Text style={styles.statsDigits}>{String(score).padStart(6, '0')}</Text>
      <Text style={styles.statsLabel}>级别</Text>
      <Text style={styles.statsDigits}>{String(level).padStart(2, '0')}</Text>
      <Text style={styles.statsLabel}>下一个</Text>
      <View style={styles.miniRow}>
        {next.map((type, i) => (
          <View key={`${type}-${i}`} style={styles.miniBox}>
            {SHAPES[type].map((row, y) =>
              row.map((v, x) =>
                v ? (
                  <View
                    key={`${x}-${y}`}
                    style={[styles.miniCell, { left: x * 5, top: y * 5, width: 4, height: 4, backgroundColor: PIECE_COLORS[type] }]}
                  />
                ) : null,
              ),
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

/** LCD 底部：喇叭 + 时钟（每分钟级精度，随渲染刷新） */
export function LcdFooter() {
  const now = new Date();
  const clock = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return (
    <View style={styles.footer}>
      <Text style={styles.speaker}>🔊</Text>
      <Text style={styles.clock}>{clock}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  decoCol: {
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 4,
    width: SQ * 4 + GAP * 3,
    gap: 6,
  },
  decoGroup: {
    flexDirection: 'row',
    gap: GAP,
  },
  decoStack: {
    gap: 1,
  },
  decoSquare: {
    width: SQ,
    height: SQ,
    backgroundColor: '#3d4a2a',
    borderRadius: 1,
  },
  stats: {
    width: 92,
    gap: 1,
    paddingVertical: 4,
  },
  statsLabel: {
    color: LCD_TEXT,
    fontSize: 10,
    letterSpacing: 1,
  },
  statsDigits: {
    color: LCD_TEXT,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  miniRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  miniBox: {
    width: 4 * 5,
    height: 4 * 5,
    backgroundColor: LCD_MINI_BG,
    borderRadius: 2,
  },
  miniCell: {
    position: 'absolute',
    borderRadius: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 2,
  },
  speaker: {
    fontSize: 11,
    color: LCD_TEXT,
  },
  clock: {
    color: LCD_TEXT,
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
});
