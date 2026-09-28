// useGameEngine：rAF 固定步长循环 + 引擎↔Store 快照同步（脏检查跳过无变化帧）
import { useCallback, useEffect, useRef } from 'react';
import type { Command, EngineEvent } from '@engine/types';
import { saveHighScore } from '../utils/storage';
import { gameEngine } from '../store/engine';
import { useGameStore } from '../store/gameStore';

export function useGameEngine() {
  const setSnapshot = useGameStore((s) => s.setSnapshot);

  const sync = useCallback(() => {
    const snap = gameEngine.getSnapshot();
    const ghostY = gameEngine.getGhostY();
    // 脏检查：无任何引用/数值变化则跳过 set，避免 60fps 空渲染
    const p = prev.current;
    const scalarsKey = `${snap.score}|${snap.level}|${snap.lines}|${snap.phase}|${ghostY}|${snap.next.join(',')}`;
    if (snap.board === p.board && snap.current === p.current && scalarsKey === p.key) return;
    prev.current = { board: snap.board, current: snap.current, key: scalarsKey };
    setSnapshot(snap, ghostY);
  }, [setSnapshot]);

  const prev = useRef({ board: null as unknown, current: null as unknown, key: '' });

  const handleEvents = useCallback(
    (events: EngineEvent[]) => {
      for (const e of events) {
        if (e.type === 'over') {
          // 游戏结束：刷新本地最高分并落盘（存储失败静默降级）
          const { score, highScore, setHighScore } = useGameStore.getState();
          if (score > highScore) {
            setHighScore(score);
            void saveHighScore(score);
          }
        }
      }
    },
    [],
  );

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(t - last, 100); // 钳制：后台恢复防跳帧
      last = t;
      const events = gameEngine.update(dt);
      if (events.length) handleEvents(events);
      sync();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sync, handleEvents]);

  const start = useCallback(() => {
    gameEngine.start();
    sync();
  }, [sync]);

  const restart = useCallback(() => {
    gameEngine.reset();
    gameEngine.start();
    sync();
  }, [sync]);

  const pause = useCallback(() => {
    gameEngine.pause();
    sync();
  }, [sync]);

  const resume = useCallback(() => {
    gameEngine.resume();
    sync();
  }, [sync]);

  const dispatch = useCallback(
    (cmd: Command) => {
      const events = gameEngine.dispatch(cmd);
      if (events.length) handleEvents(events);
      sync();
    },
    [sync, handleEvents],
  );

  return { start, restart, pause, resume, dispatch };
}
