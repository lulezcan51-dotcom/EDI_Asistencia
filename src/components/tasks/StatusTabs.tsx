import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, space, touch } from '../../theme/tokens';
import { type } from '../../theme/typography';
import type { TaskStatus } from '../../types/task';

const options: { key: TaskStatus; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendientes', label: 'Pendientes' },
  { key: 'completadas', label: 'Completadas' },
];

export function StatusTabs({ current, onChange }: { current: TaskStatus; onChange: (value: TaskStatus) => void }) {
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {options.map((item) => {
        const active = current === item.key;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            hitSlop={touch.hitSlop}
            onPress={() => onChange(item.key)}
            style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && styles.pressed]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.line, marginBottom: space.lg },
  tab: { flex: 1, minHeight: touch.minTarget, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.ink },
  text: { ...type.meta, color: colors.muted },
  textActive: { color: colors.ink, fontWeight: '600' },
  pressed: { opacity: 0.6 },
});
