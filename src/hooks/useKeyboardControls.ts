// useKeyboardControls：网页版键盘操控（仅 Web 平台生效）
// 按键映射：←→水平移动 / ↓软降 / ↑旋转 / 空格硬降
// 防默认行为：阻止方向键滚动页面、空格翻页
// 长按处理：自管理 DAS（首次立即触发，按住 170ms 后每 90ms 重复一次）；
//            硬降为瞬时动作不重复；忽略浏览器原生 key repeat，避免双重加速
import { useEffect } from 'react';
import { Platform } from 'react-native';
import type { Command } from '@engine/types';

const KEY_MAP: Record<string, Command> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowDown: 'softDrop',
  ArrowUp: 'rotate',
  ' ': 'hardDrop',
  Spacebar: 'hardDrop', // 旧版浏览器兼容
};

/** 长按可连续触发的指令（硬降除外：重复硬降会让方块瞬间坠底，体验混乱） */
const REPEATABLE: ReadonlySet<Command> = new Set<Command>(['left', 'right', 'softDrop', 'rotate']);

const REPEAT_DELAY = 170; // 长按启动重复的延迟（ms）
const REPEAT_INTERVAL = 90; // 重复间隔（ms）

interface TimerPair {
  delay?: ReturnType<typeof setTimeout>;
  interval?: ReturnType<typeof setInterval>;
}

export function useKeyboardControls(dispatch: (cmd: Command) => void, enabled: boolean) {
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) return;

    const timers = new Map<string, TimerPair>();

    const clearAll = () => {
      timers.forEach((t) => {
        if (t.delay) clearTimeout(t.delay);
        if (t.interval) clearInterval(t.interval);
      });
      timers.clear();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const cmd = KEY_MAP[e.key];
      if (!cmd) return;
      e.preventDefault(); // 阻止默认滚动 / 翻页 / 空格激活焦点按钮
      if (e.repeat || timers.has(e.key)) return; // 自管理重复，忽略系统 repeat
      dispatch(cmd);
      if (REPEATABLE.has(cmd)) {
        const pair: TimerPair = {};
        pair.delay = setTimeout(() => {
          pair.interval = setInterval(() => dispatch(cmd), REPEAT_INTERVAL);
        }, REPEAT_DELAY);
        timers.set(e.key, pair);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const pair = timers.get(e.key);
      if (pair) {
        if (pair.delay) clearTimeout(pair.delay);
        if (pair.interval) clearInterval(pair.interval);
        timers.delete(e.key);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearAll); // 切窗时释放所有长按，防"卡键"

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearAll);
      clearAll();
    };
  }, [dispatch, enabled]);
}
