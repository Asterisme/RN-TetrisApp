import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameScreen } from './src/screens/GameScreen';
import { useSettingsStore } from './src/store/settingsStore';
import { SHELL_BG } from './src/components/colors';

export default function App() {
  const loadSettings = useSettingsStore((s) => s.load);

  // 启动时从磁盘恢复设置
  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <GameScreen />
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SHELL_BG,
  },
});
