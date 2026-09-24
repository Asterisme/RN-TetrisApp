// GameScreen：主游戏界面（v1 条件渲染三个 phase，不引入导航库）
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { Board } from '../components/Board';
import { HUD } from '../components/HUD';
import { NextPanel } from '../components/NextPanel';
import { TempControls } from '../components/TempControls';
import { useGameEngine } from '../hooks/useGameEngine';
import { SCREEN_BG, TEXT_DIM, TEXT_MAIN } from '../components/colors';

export function GameScreen() {
  const phase = useGameStore((s) => s.phase);
  const score = useGameStore((s) => s.score);
  const { start, restart, pause, resume, dispatch } = useGameEngine();

  if (phase === 'ready') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>RN TETRIS</Text>
          <Text style={styles.hint}>React Native 俄罗斯方块</Text>
          <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={start}>
            <Text style={styles.primaryLabel}>开始游戏</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <HUD />
        <Board />
        <NextPanel />
      </View>

      <View style={styles.controls}>
        <TempControls
          dispatch={dispatch}
          paused={phase === 'paused'}
          onPauseToggle={phase === 'paused' ? resume : pause}
        />
      </View>

      {phase === 'paused' && (
        <View style={styles.overlay}>
          <Text style={styles.title}>已暂停</Text>
          <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={resume}>
            <Text style={styles.primaryLabel}>继续</Text>
          </Pressable>
        </View>
      )}

      <Modal transparent visible={phase === 'over'} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.title}>GAME OVER</Text>
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
  safe: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  top: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0b1220',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 44,
  },
  title: {
    color: TEXT_MAIN,
    fontSize: 28,
    fontWeight: '500',
    letterSpacing: 2,
  },
  hint: {
    color: TEXT_DIM,
    fontSize: 13,
  },
  score: {
    color: TEXT_MAIN,
    fontSize: 40,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 36,
  },
  pressed: {
    opacity: 0.7,
  },
  primaryLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
