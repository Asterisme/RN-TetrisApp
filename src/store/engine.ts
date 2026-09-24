// 引擎单例：全 App 共享一个引擎实例（不放进 Zustand store，避免被快照机制克隆）
import { GameEngine } from '@engine/GameEngine';

export const gameEngine = new GameEngine();
