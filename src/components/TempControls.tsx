// TempControls：临时按钮组（Phase 4 将替换为手势操控）
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { Command } from '@engine/types';
import { BOARD_BORDER, TEXT_MAIN } from './colors';

interface Props {
  dispatch: (cmd: Command) => void;
  paused: boolean;
  onPauseToggle: () => void;
}

const BUTTONS: { label: string; cmd?: Command; action?: 'pause' }[] = [
  { label: '◀', cmd: 'left' },
  { label: '▼', cmd: 'softDrop' },
  { label: '▶', cmd: 'right' },
  { label: '⟳', cmd: 'rotate' },
  { label: '⤓', cmd: 'hardDrop' },
  { label: '❚❚', action: 'pause' },
];

export function TempControls({ dispatch, paused, onPauseToggle }: Props) {
  return (
    <>
      {BUTTONS.map(({ label, cmd, action }) => (
        <Pressable
          key={label}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          onPress={() => {
            if (action === 'pause') onPauseToggle();
            else if (cmd) dispatch(cmd);
          }}
        >
          <Text style={[styles.label, action === 'pause' && paused && styles.pausedLabel]}>{label}</Text>
        </Pressable>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 52,
    height: 44,
    borderRadius: 8,
    borderColor: BOARD_BORDER,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    color: TEXT_MAIN,
    fontSize: 18,
  },
  pausedLabel: {
    color: '#facc15',
  },
});
