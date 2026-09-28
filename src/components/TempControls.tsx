// TempControls：手柄式控制区 —— 十字键（D-pad）+ 独立暂停键（Phase 4 手势的备用操控方式）
// 十字布局：上=硬降(⤓) / 左=移动(◀) / 中=旋转(⟳) / 右=移动(▶) / 下=软降(▼)
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Command } from '@engine/types';
import { BOARD_BORDER, TEXT_MAIN } from './colors';

const BTN = 64; // 单键尺寸（十字区 3×3 网格，中心臂 5 键）

interface Cell {
  row: number;
  col: number;
  label: string;
  cmd: Command;
  accent?: boolean;
}

const DPAD: Cell[] = [
  { row: 0, col: 1, label: '⤓', cmd: 'hardDrop', accent: true },
  { row: 1, col: 0, label: '◀', cmd: 'left' },
  { row: 1, col: 1, label: '⟳', cmd: 'rotate' },
  { row: 1, col: 2, label: '▶', cmd: 'right' },
  { row: 2, col: 1, label: '▼', cmd: 'softDrop' },
];

interface Props {
  dispatch: (cmd: Command) => void;
  paused: boolean;
  onPauseToggle: () => void;
}

export function TempControls({ dispatch, paused, onPauseToggle }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.dpad}>
        {DPAD.map((c) => (
          <Pressable
            key={c.label}
            style={({ pressed }) => [
              styles.btn,
              {
                left: c.col * BTN + 1,
                top: c.row * BTN + 1,
                width: BTN - 2,
                height: BTN - 2,
              },
              c.accent && styles.accentBtn,
              pressed && styles.pressed,
            ]}
            onPress={() => dispatch(c.cmd)}
          >
            <Text style={[styles.label, c.accent && styles.accentLabel]}>{c.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [styles.pause, paused && styles.pauseActive, pressed && styles.pressed]}
        onPress={onPauseToggle}
      >
        <Text style={styles.label}>{paused ? '▶' : '❚❚'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    paddingBottom: 12,
  },
  dpad: {
    width: BTN * 3,
    height: BTN * 3,
  },
  btn: {
    position: 'absolute',
    borderRadius: 14,
    backgroundColor: '#16233c',
    borderColor: BOARD_BORDER,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentBtn: {
    backgroundColor: '#b45309',
    borderColor: '#ea580c',
  },
  pressed: {
    opacity: 0.55,
  },
  label: {
    color: TEXT_MAIN,
    fontSize: 24,
  },
  accentLabel: {
    color: '#fff',
  },
  pause: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#16233c',
    borderColor: BOARD_BORDER,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseActive: {
    borderColor: '#facc15',
  },
});
