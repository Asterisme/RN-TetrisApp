// TouchLayer：棋盘手势层（gesture-handler，runOnJS 模式——v1 手势频率低，JS 线程足够）
// 手势语义：
//   单击            → 旋转
//   水平滑          → 按格数移动（一次滑多格移多格）
//   垂直慢滑        → 软降（按格数逐格触发）
//   垂直快速下滑     → 硬降
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { Command } from '@engine/types';
import type { Sensitivity } from '../store/settingsStore';

/** 灵敏度 → 每格触发距离系数（越小越灵敏） */
const STEP_FACTOR: Record<Sensitivity, number> = {
  low: 1.4,
  medium: 1.0,
  high: 0.65,
};

/** 硬降判定：垂直位移与纵向速度阈值 */
const HARD_DROP_MIN_DISTANCE = 40;
const HARD_DROP_MIN_VELOCITY = 1200;

interface Props {
  cell: number;
  sensitivity: Sensitivity;
  dispatch: (cmd: Command) => void;
  children: React.ReactNode;
}

export function TouchLayer({ cell, sensitivity, dispatch, children }: Props) {
  const drag = useRef({ lastX: 0, lastY: 0, accX: 0, accY: 0, moved: false });

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onBegin(() => {
      drag.current = { lastX: 0, lastY: 0, accX: 0, accY: 0, moved: false };
    })
    .onUpdate((e) => {
      const step = cell * STEP_FACTOR[sensitivity];
      const dX = e.translationX - drag.current.lastX;
      const dY = e.translationY - drag.current.lastY;
      drag.current.lastX = e.translationX;
      drag.current.lastY = e.translationY;
      drag.current.accX += dX;
      drag.current.accY += dY;

      // 水平：累计够一格就移一格（连续拖动多格）
      while (Math.abs(drag.current.accX) >= step) {
        dispatch(drag.current.accX > 0 ? 'right' : 'left');
        drag.current.accX -= Math.sign(drag.current.accX) * step;
        drag.current.moved = true;
      }
      // 垂直向下：累计够一格软降一格
      while (drag.current.accY >= step) {
        dispatch('softDrop');
        drag.current.accY -= step;
        drag.current.moved = true;
      }
    })
    .onEnd((e) => {
      if (
        e.translationY > HARD_DROP_MIN_DISTANCE &&
        e.velocityY > HARD_DROP_MIN_VELOCITY
      ) {
        dispatch('hardDrop');
      }
      drag.current = { lastX: 0, lastY: 0, accX: 0, accY: 0, moved: false };
    });

  const tap = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => {
      dispatch('rotate');
    });

  // Exclusive：有拖动时 tap 让位于 pan，避免误旋转
  const gesture = Gesture.Exclusive(pan, tap);

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.layer}>{children}</View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  layer: {
    // 透明手势层：包裹 Board，不遮挡其渲染
  },
});
