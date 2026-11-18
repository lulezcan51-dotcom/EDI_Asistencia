import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, touch } from '../theme/tokens';
import type { TaskStatus } from '../types/task';

const options: { key: TaskStatus; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendientes', label: 'Pendientes' },
  { key: 'completadas', label: 'Completadas' },
];

type Props = { current: TaskStatus; onChange: (status: TaskStatus) => void };

export function StatusTabs({ current, onChange }: Props) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {options.map((item) => {
        const active = current === item.key;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            hitSlop={touch.hitSlop}
            onPress={() => onChange(item.key)}
            style={({ pressed }) => [styles.button, active && styles.active, pressed && styles.pressed]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    padding: space.xs,
    borderRadius: radius.lg,
    gap: space.xs,
    marginBottom: space.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  button: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: space.sm,
    minHeight: touch.minTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  active: { backgroundColor: colors.primary },
  text: { color: colors.textMuted, fontWeight: '700', fontSize: 12 },
  textActive: { color: colors.onPrimary },
  pressed: { opacity: 0.7 },
});
