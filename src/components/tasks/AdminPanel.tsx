import { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, touch } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { useReduceMotion } from '../../theme/motion';
import type { TaskPriority } from '../../types/task';
import { getPriorityCounts, type PriorityFilter, type TaskSort } from '../../utils/taskAdmin';
import { Icon } from '../ui/Icon';
import { Badge, Button, Divider } from '../ui/Primitives';

type Props = {
  taskCount: number;
  priorityFilter: PriorityFilter;
  onPriorityFilter: (value: PriorityFilter) => void;
  sort: TaskSort;
  onSort: (value: TaskSort) => void;
  onCompleteAll: () => void;
  onClearCompleted: () => void;
  counts: Record<TaskPriority, number>;
};

const priorities: { key: PriorityFilter; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'alta', label: 'Alta' },
  { key: 'media', label: 'Media' },
  { key: 'baja', label: 'Baja' },
];

const sorts: { key: TaskSort; label: string }[] = [
  { key: 'default', label: 'Original' },
  { key: 'priority', label: 'Prioridad' },
  { key: 'title', label: 'Nombre' },
  { key: 'status', label: 'Estado' },
];

export function AdminPanel({ priorityFilter, onPriorityFilter, sort, onSort, onCompleteAll, onClearCompleted, counts }: Props) {
  const [open, setOpen] = useState(false);
  const reduce = useReduceMotion();
  const chevron = useState(() => new Animated.Value(0))[0];

  function toggle() {
    const next = !open;
    setOpen(next);
    if (!reduce) {
      Animated.timing(chevron, { toValue: next ? 1 : 0, duration: 220, useNativeDriver: true }).start();
    }
  }

  const rotate = chevron.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={styles.panel} testID="admin-panel">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={open ? 'Contraer administración' : 'Expandir administración'}
        testID="admin-toggle"
        hitSlop={touch.hitSlop}
        onPress={toggle}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <View style={styles.icon}><Icon name="sliders" size={17} color={colors.ink} /></View>
          <View>
            <Text style={styles.title}>Administrar</Text>
            <Text style={styles.sub}>Filtros, orden y acciones</Text>
          </View>
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Icon name="chevron" size={18} color={colors.muted} />
        </Animated.View>
      </Pressable>

      {open ? (
        <View style={styles.body}>
          <View style={styles.counts}>
            <Count label="Alta" value={counts.alta} tone="high" />
            <Divider />
            <Count label="Media" value={counts.media} tone="mid" />
            <Divider />
            <Count label="Baja" value={counts.baja} tone="low" />
          </View>

          <Text style={styles.group}>Filtrar por prioridad</Text>
          <View style={styles.chips}>
            {priorities.map((item) => (
              <Chip key={item.key} label={item.label} active={priorityFilter === item.key} onPress={() => onPriorityFilter(item.key)} testID={`priority-${item.key}`} />
            ))}
          </View>

          <Text style={styles.group}>Ordenar por</Text>
          <View style={styles.chips}>
            {sorts.map((item) => (
              <Chip key={item.key} label={item.label} active={sort === item.key} onPress={() => onSort(item.key)} testID={`sort-${item.key}`} />
            ))}
          </View>

          <Text style={styles.group}>Acciones en lote</Text>
          <View style={styles.actions}>
            <Button label="Completar todas" onPress={onCompleteAll} variant="ghost" testID="complete-all-button" flex />
            <Button label="Limpiar completadas" onPress={onClearCompleted} variant="ghost" testID="clear-completed-button" flex />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Count({ label, value, tone }: { label: string; value: number; tone: 'high' | 'mid' | 'low' }) {
  return (
    <View style={styles.count}>
      <Badge label={label.toUpperCase()} tone={tone} />
      <Text style={styles.countValue}>{String(value).padStart(2, '0')}</Text>
    </View>
  );
}

function Chip({ label, active, onPress, testID }: { label: string; active: boolean; onPress: () => void; testID: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      testID={testID}
      hitSlop={touch.hitSlop}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, marginBottom: space.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.lg, minHeight: touch.minTarget },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  icon: { width: 34, height: 34, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  title: { ...type.title, color: colors.ink, fontSize: 14 },
  sub: { ...type.meta, color: colors.muted, marginTop: 2 },
  body: { paddingHorizontal: space.lg, paddingBottom: space.lg, borderTopWidth: 1, borderTopColor: colors.line },
  counts: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.lg, gap: space.md },
  count: { flex: 1, alignItems: 'center', gap: 6 },
  countValue: { ...type.stat, color: colors.ink, fontSize: 22 },
  group: { ...type.eyebrow, marginTop: space.lg, marginBottom: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { minHeight: 36, paddingHorizontal: space.md, justifyContent: 'center', borderRadius: radius.xs, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { ...type.meta, color: colors.inkSoft },
  chipTextActive: { color: colors.onAccent },
  actions: { flexDirection: 'row', gap: space.sm },
  pressed: { opacity: 0.6 },
});
