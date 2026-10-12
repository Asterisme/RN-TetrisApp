// TempControls：掌机控制区（参照经典掌机布局）
// 上排功能键：暂停(P)绿 / 音效(S)绿 / 重玩(R)红；主控：左=大「掉落」蓝键，右=十字键（旋转/左移/右移/下移，键下带标签）
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Command } from '@engine/types';
import { BTN_BLUE, BTN_BLUE_BORDER, BTN_CAPTION, BTN_GREEN, BTN_GREEN_BORDER, BTN_RED, BTN_RED_BORDER, SHELL_SHADOW } from './colors';

const BTN = 62; // 十字键尺寸
const CAP_H = 16; // 键下文字标签高度

const SHADOW = {
  shadowColor: SHELL_SHADOW,
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 4,
  elevation: 4,
};

interface Cell {
  row: number;
  col: number;
  label: string;
  caption: string;
  cmd: Command;
}

const DPAD: Cell[] = [
  { row: 0, col: 1, label: '⟳', caption: '旋转', cmd: 'rotate' },
  { row: 1, col: 0, label: '◀', caption: '左移', cmd: 'left' },
  { row: 1, col: 2, label: '▶', caption: '右移', cmd: 'right' },
  { row: 2, col: 1, label: '▼', caption: '下移', cmd: 'softDrop' },
];

interface Props {
  dispatch: (cmd: Command) => void;
  paused: boolean;
  onPauseToggle: () => void;
  onRestart: () => void;
  onSound: () => void;
}

export function TempControls({ dispatch, paused, onPauseToggle, onRestart, onSound }: Props) {
  return (
    <View style={styles.wrapper}>
      {/* 功能键行：暂停 / 音效 / 重玩 */}
      <View style={styles.funcRow}>
        <View style={styles.funcWrap}>
          <Pressable
            style={({ pressed }) => [styles.funcBtn, styles.pauseBtn, SHADOW, pressed && styles.pressed]}
            onPress={onPauseToggle}
          >
            <Text style={styles.funcIcon}>{paused ? '▶' : '❚❚'}</Text>
          </Pressable>
          <Text style={styles.caption}>{paused ? '继续' : '暂停'}</Text>
        </View>
        <View style={styles.funcWrap}>
          <Pressable
            style={({ pressed }) => [styles.funcBtn, styles.pauseBtn, SHADOW, pressed && styles.pressed]}
            onPress={onSound}
          >
            <Text style={styles.funcIcon}>🔊</Text>
          </Pressable>
          <Text style={styles.caption}>音效</Text>
        </View>
        <View style={styles.funcWrap}>
          <Pressable
            style={({ pressed }) => [styles.funcBtn, styles.restartBtn, SHADOW, pressed && styles.pressed]}
            onPress={onRestart}
          >
            <Text style={styles.funcIcon}>↻</Text>
          </Pressable>
          <Text style={styles.caption}>重玩</Text>
        </View>
      </View>

      {/* 主控行：大掉落键 + 十字键 */}
      <View style={styles.mainRow}>
        <View style={styles.dropWrap}>
          <Pressable
            style={({ pressed }) => [styles.dropBtn, SHADOW, pressed && styles.pressed]}
            onPress={() => dispatch('hardDrop')}
          >
            <Text style={styles.iconLg}>⤓</Text>
          </Pressable>
          <Text style={styles.caption}>掉落</Text>
        </View>

        <View style={styles.dpad}>
          {DPAD.map((c) => (
            <View
              key={c.caption}
              style={{
                position: 'absolute',
                left: c.col * BTN,
                top: c.row * (BTN + CAP_H),
                width: BTN,
                alignItems: 'center',
              }}
            >
              <Pressable
                style={({ pressed }) => [styles.btn, { width: BTN - 4, height: BTN - 4 }, SHADOW, pressed && styles.pressed]}
                onPress={() => dispatch(c.cmd)}
              >
                <Text style={styles.icon}>{c.label}</Text>
              </Pressable>
              <Text style={styles.caption}>{c.caption}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 6,
    paddingBottom: 6,
  },
  funcRow: {
    flexDirection: 'row',
    gap: 22,
    alignSelf: 'flex-start',
    paddingLeft: 30,
  },
  funcWrap: {
    alignItems: 'center',
  },
  funcBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pauseBtn: {
    backgroundColor: BTN_GREEN,
    borderColor: BTN_GREEN_BORDER,
  },
  restartBtn: {
    backgroundColor: BTN_RED,
    borderColor: BTN_RED_BORDER,
  },
  funcIcon: {
    color: '#fff',
    fontSize: 15,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingLeft: '9%',
    paddingRight: '2%',
  },
  dropWrap: {
    alignItems: 'center',
  },
  dropBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: BTN_BLUE,
    borderColor: BTN_BLUE_BORDER,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLg: {
    color: '#fff',
    fontSize: 30,
  },
  dpad: {
    width: BTN * 3,
    height: 3 * (BTN + CAP_H),
  },
  btn: {
    borderRadius: 31,
    backgroundColor: BTN_BLUE,
    borderColor: BTN_BLUE_BORDER,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#fff',
    fontSize: 22,
  },
  caption: {
    color: BTN_CAPTION,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.55,
  },
});
