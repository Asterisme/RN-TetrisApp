// 生命周期守卫：App 切后台自动暂停 + Android 返回键接管为暂停
import { useEffect } from 'react';
import { AppState, BackHandler } from 'react-native';
import { useGameStore } from '../store/gameStore';

export function useGameLifecycle(pause: () => void) {
  // 切后台自动暂停（回前台保持暂停，由用户手动恢复）
  useEffect(() => {
    const sub = AppState.addEventListener('change', (status) => {
      if (status !== 'active' && useGameStore.getState().phase === 'playing') {
        pause();
      }
    });
    return () => sub.remove();
  }, [pause]);

  // Android 返回键：playing → 暂停；paused → 拦截不退出；ready/over → 系统默认
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const phase = useGameStore.getState().phase;
      if (phase === 'playing') {
        pause();
        return true;
      }
      return phase === 'paused';
    });
    return () => sub.remove();
  }, [pause]);
}
