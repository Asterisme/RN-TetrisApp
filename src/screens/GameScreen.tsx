// GameScreen：主游戏界面（掌机化布局：黄壳机身 + LCD 屏 + 底部控制区；v1 条件渲染，不引入导航库）
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLS, ROWS } from '@engine/constants';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { Board } from '../components/Board';
import { DecorationColumn, LcdFooter, LcdStatsPanel } from '../components/Handheld';
import { TempControls } from '../components/TempControls';
import { TouchLayer } from '../components/TouchLayer';
import { useGameEngine } from '../hooks/useGameEngine';
import { useGameLifecycle } from '../hooks/useGameLifecycle';
import { SettingsScreen } from './SettingsScreen';
import { LCD_FRAME, SHELL_BG, SHELL_DOTS, SHELL_SHADOW, SHELL_TEXT, TEXT_MAIN } from '../components/colors';

// 机身两侧装饰方柱图案（每组数字为该列方块数）
const LEFT_PATTERNS = [[2, 2], [3, 1], [2, 2], [4, 2], [3, 2], [2, 1]];
const RIGHT_PATTERNS = [[3, 2], [3, 2], [4, 2], [3, 2], [4, 1], [2, 1], [2, 1]];

export function GameScreen() {
  const phase = useGameStore((s) => s.phase);
  const score = useGameStore((s) => s.score);
  const sensitivity = useSettingsStore((s) => s.sensitivity);
  const { start, restart, pause, resume, dispatch } = useGameEngine();
  useGameLifecycle(pause);

  const [view, setView] = useState<'menu' | 'settings'>('menu');
  const [playArea, setPlayArea] = useState({ w: 0, h: 0 });
  const [toast, setToast] = useState<string | null>(null);
  // 棋盘区实测尺寸 → 自动取最大格子（棋盘尽量占满 LCD）
  const cell = Math.max(8, Math.floor(Math.min((playArea.w - 6) / COLS, (playArea.h - 4) / ROWS)));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1500);
  };

  // ready 状态：掌机风格开始菜单
  if (phase === 'ready') {
    return view === 'settings' ? (
      <SettingsScreen onBack={() => setView('menu')} />
    ) : (
      <SafeAreaView style={styles.shell}>
        <View style={styles.titleRow}>
          <View style={styles.dots} />
          <Text style={styles.titleText}>俄罗斯方块</Text>
          <View style={styles.dots} />
        </View>
        <View style={styles.menuCenter}>
          <Pressable style={({ pressed }) => [styles.menuBtn, pressed && styles.pressed]} onPress={start}>
            <Text style={styles.menuBtnLabel}>开始游戏</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.menuBtnGhost, pressed && styles.pressed]} onPress={() => setView('settings')}>
            <Text style={styles.menuBtnGhostLabel}>设置</Text>
          </Pressable>
          <Text style={styles.hint}>点击旋转 · 左右滑移动 · 下滑软降 · 快滑硬降</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.shell}>
      {/* 标题行：虚线 + 标题 */}
      <View style={styles.titleRow}>
        <View style={styles.dots} />
        <Text style={styles.titleText}>俄罗斯方块</Text>
        <View style={styles.dots} />
      </View>

      {/* LCD 屏：装饰柱 + 棋盘 + 统计栏 + 底栏 */}
      <View style={styles.lcd}>
        <View style={styles.lcdInner}>
          <DecorationColumn patterns={LEFT_PATTERNS} />
          <View
            style={styles.playWrap}
            onLayout={(e) => {
              const { width: w, height: h } = e.nativeEvent.layout;
              if (Math.abs(w - playArea.w) > 1 || Math.abs(h - playArea.h) > 1) {
                setPlayArea({ w, h });
              }
            }}
          >
            {playArea.w > 0 && (
              <TouchLayer cell={cell} sensitivity={sensitivity} dispatch={dispatch}>
                <Board cell={cell} />
              </TouchLayer>
            )}
          </View>
          <LcdStatsPanel />
          <DecorationColumn patterns={RIGHT_PATTERNS} />
        </View>
        <LcdFooter />
      </View>

      {/* 控制区 */}
      <View style={styles.padArea}>
        <TempControls
          dispatch={dispatch}
          paused={phase === 'paused'}
          onPauseToggle={phase === 'paused' ? resume : pause}
          onRestart={restart}
          onSound={() => showToast('音效将在 v2 版本开放')}
        />
      </View>

      {/* 轻提示（toast） */}
      {toast && (
        <View style={styles.toastBox} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {/* 暂停遮罩 */}
      {phase === 'paused' && (
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>已暂停</Text>
          <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={resume}>
            <Text style={styles.primaryLabel}>继续</Text>
          </Pressable>
        </View>
      )}

      {/* Game Over 弹层 */}
      <Modal transparent visible={phase === 'over'} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.overlayTitle}>GAME OVER</Text>
            <Text style={styles.score}>{score}</Text>
            <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={restart}>
              <Text style={styles.primaryLabel}>再来一局</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: SHELL_BG,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  dots: {
    flex: 1,
    height: 0,
    borderTopWidth: 3,
    borderStyle: 'dotted',
    borderColor: SHELL_DOTS,
  },
  titleText: {
    color: SHELL_TEXT,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 6,
    marginHorizontal: 12,
  },
  // LCD 屏
  lcd: {
    flex: 1,
    margin: 10,
    borderWidth: 6,
    borderColor: LCD_FRAME,
    borderRadius: 14,
    backgroundColor: '#a8bd85',
    overflow: 'hidden',
  },
  lcdInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: 4,
    gap: 4,
  },
  playWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  padArea: {
    paddingBottom: 8,
  },
  // 开始菜单
  menuCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  menuBtn: {
    backgroundColor: '#2f5fd0',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 52,
    shadowColor: SHELL_SHADOW,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  menuBtnLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 2,
  },
  menuBtnGhost: {
    borderColor: '#8a6a00',
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 52,
  },
  menuBtnGhostLabel: {
    color: SHELL_TEXT,
    fontSize: 15,
    letterSpacing: 2,
  },
  hint: {
    color: SHELL_TEXT,
    fontSize: 12,
    opacity: 0.75,
  },
  // 遮罩 / 弹层（深色，压在黄壳上）
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30, 25, 5, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  overlayTitle: {
    color: TEXT_MAIN,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 3,
  },
  primaryBtn: {
    backgroundColor: '#2f5fd0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 36,
  },
  primaryLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  score: {
    color: TEXT_MAIN,
    fontSize: 40,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 25, 5, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff7d6',
    borderColor: '#8a6a00',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 44,
  },
  toastBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 260,
    alignItems: 'center',
  },
  toastText: {
    backgroundColor: 'rgba(30, 25, 5, 0.85)',
    color: '#fff',
    fontSize: 12,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.7,
  },
});
