import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, touch, type } from '../theme/tokens';
import type { TaskPriority } from '../types/task';
import { getPriorityCounts, type PriorityFilter, type TaskSort } from '../utils/taskAdmin';

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

const priorityOptions: { key: PriorityFilter; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'alta', label: 'Alta' },
  { key: 'media', label: 'Media' },
  { key: 'baja', label: 'Baja' },
];

const sortOptions: { key: TaskSort; label: string }[] = [
  { key: 'default', label: 'Original' },
  { key: 'priority', label: 'Prioridad' },
  { key: 'title', label: 'Nombre' },
  { key: 'status', label: 'Estado' },
];

export function AdminPanel({
  taskCount,
  priorityFilter,
  onPriorityFilter,
  sort,
  onSort,
  onCompleteAll,
  onClearCompleted,
  counts,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.panel} testID="admin-panel">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={open ? 'Contraer panel de administración' : 'Expandir panel de administración'}
        testID="admin-toggle"
        hitSlop={touch.hitSlop}
        onPress={() => setOpen((current) => !current)}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconText}>⚙</Text>
          </View>
          <View>
            <Text style={styles.title}>Administrar tareas</Text>
            <Text style={styles.subtitle}>Filtros, orden y acciones en lote</Text>
          </View>
        </View>
        <Text style={styles.chevron}>{open ? '⌃' : '⌄'}</Text>
      </Pressable>

      {open ? (
        <View style={styles.body}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryChip}>
              <Text style={[styles.summaryNumber, { color: colors.destructive }]}>{counts.alta}</Text>
              <Text style={styles.summaryLabel}>ALTA</Text>
            </View>
            <View style={styles.summaryChip}>
              <Text style={[styles.summaryNumber, { color: colors.warning }]}>{counts.media}</Text>
              <Text style={styles.summaryLabel}>MEDIA</Text>
            </View>
            <View style={styles.summaryChip}>
              <Text style={[styles.summaryNumber, { color: colors.primary }]}>{counts.baja}</Text>
              <Text style={styles.summaryLabel}>BAJA</Text>
            </View>
          </View>

          <Text style={styles.groupLabel}>FILTRAR POR PRIORIDAD</Text>
          <View style={styles.chipRow}>
            {priorityOptions.map((option) => {
              const active = priorityFilter === option.key;
              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  testID={`priority-${option.key}`}
                  hitSlop={touch.hitSlop}
                  onPress={() => onPriorityFilter(option.key)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.groupLabel}>ORDENAR POR</Text>
          <View style={styles.chipRow}>
            {sortOptions.map((option) => {
              const active = sort === option.key;
              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  testID={`sort-${option.key}`}
                  hitSlop={touch.hitSlop}
                  onPress={() => onSort(option.key)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.groupLabel}>ACCIONES EN LOTE</Text>
          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Marcar todas las tareas como completadas"
              testID="complete-all-button"
              hitSlop={touch.hitSlop}
              onPress={onCompleteAll}
              disabled={taskCount === 0}
              style={[styles.actionButton, styles.actionPrimary, taskCount === 0 && styles.disabled]}
            >
              <Text style={[styles.actionText, styles.actionTextPrimary]}>✓ Completar todas</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Eliminar todas las tareas completadas"
              testID="clear-completed-button"
              hitSlop={touch.hitSlop}
              onPress={onClearCompleted}
              style={[styles.actionButton, styles.actionDanger]}
            >
              <Text style={[styles.actionText, styles.actionTextDanger]}>✕ Limpiar completadas</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: space.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space.lg,
    minHeight: touch.minTarget,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: space.md, flex: 1 },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { color: colors.primary, fontSize: 17, fontWeight: '800' },
  title: { color: colors.foreground, fontSize: 14, fontWeight: '800' },
  subtitle: { color: colors.textSubtle, fontSize: 11, marginTop: 2 },
  chevron: { color: colors.primary, fontSize: 20, fontWeight: '800', paddingHorizontal: space.sm },
  body: { paddingHorizontal: space.lg, paddingBottom: space.lg, borderTopWidth: 1, borderTopColor: colors.borderSoft },
  summaryRow: { flexDirection: 'row', gap: space.sm, marginTop: space.lg, marginBottom: space.lg },
  summaryChip: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingVertical: space.sm,
    alignItems: 'center',
  },
  summaryNumber: { fontSize: 18, fontWeight: '800' },
  summaryLabel: { fontSize: 9, fontWeight: '800', color: colors.textSubtle, letterSpacing: 0.6, marginTop: 2 },
  groupLabel: { ...type.eyebrow, color: colors.textSubtle, marginBottom: space.sm, marginTop: space.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    minHeight: touch.minTarget,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  chipTextActive: { color: colors.onPrimary },
  actionsRow: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  actionButton: {
    flex: 1,
    minHeight: touch.minTarget,
    borderRadius: radius.md,
    paddingHorizontal: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: { backgroundColor: colors.primary },
  actionDanger: { backgroundColor: colors.destructiveSoft, borderWidth: 1, borderColor: colors.destructive },
  actionText: { fontSize: 12, fontWeight: '800', textAlign: 'center' },
  actionTextPrimary: { color: colors.onPrimary },
  actionTextDanger: { color: colors.destructive },
  disabled: { opacity: 0.5 },
});
