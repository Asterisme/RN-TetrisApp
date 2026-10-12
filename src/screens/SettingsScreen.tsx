// SettingsScreen：幽灵方块开关 + 手势灵敏度（改动即持久化，掌机黄壳风格）
import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore, type Sensitivity } from '../store/settingsStore';
import { SHELL_BG, SHELL_SHADOW, SHELL_TEXT } from '../components/colors';

const SENSITIVITY_OPTIONS: { key: Sensitivity; label: string }[] = [
  { key: 'low', label: '低' },
  { key: 'medium', label: '中' },
  { key: 'high', label: '高' },
];

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const ghostEnabled = useSettingsStore((s) => s.ghostEnabled);
  const sensitivity = useSettingsStore((s) => s.sensitivity);
  const setGhostEnabled = useSettingsStore((s) => s.setGhostEnabled);
  const setSensitivity = useSettingsStore((s) => s.setSensitivity);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>‹ 返回</Text>
        </Pressable>
        <Text style={styles.title}>设置</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.group}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>幽灵方块</Text>
            <Text style={styles.rowDesc}>在落点位置显示半透明预览</Text>
          </View>
          <Switch value={ghostEnabled} onValueChange={setGhostEnabled} />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>手势灵敏度</Text>
            <Text style={styles.rowDesc}>滑动触发一格移动所需的距离</Text>
          </View>
        </View>
        <View style={styles.options}>
          {SENSITIVITY_OPTIONS.map(({ key, label }) => (
            <Pressable
              key={key}
              style={({ pressed }) => [
                styles.option,
                sensitivity === key && styles.optionActive,
                pressed && styles.pressed,
              ]}
              onPress={() => setSensitivity(key)}
            >
              <Text style={[styles.optionLabel, sensitivity === key && styles.optionLabelActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: SHELL_BG,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  back: {
    color: '#2f5fd0',
    fontSize: 16,
    width: 44,
  },
  title: {
    color: SHELL_TEXT,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
  },
  group: {
    gap: 18,
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff7d6',
    borderColor: '#8a6a00',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    shadowColor: SHELL_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  rowText: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  rowTitle: {
    color: SHELL_TEXT,
    fontSize: 15,
  },
  rowDesc: {
    color: SHELL_TEXT,
    fontSize: 12,
    opacity: 0.7,
  },
  options: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderColor: '#8a6a00',
    borderWidth: 1,
    backgroundColor: '#fff7d6',
  },
  optionActive: {
    borderColor: '#2f5fd0',
    backgroundColor: '#e3ebff',
  },
  pressed: {
    opacity: 0.7,
  },
  optionLabel: {
    color: SHELL_TEXT,
    fontSize: 14,
  },
  optionLabelActive: {
    color: '#2f5fd0',
    fontWeight: '600',
  },
});
