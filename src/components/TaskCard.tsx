import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, touch, type } from '../theme/tokens';
import type { Task, TaskPriority } from '../types/task';

type TaskCardProps = {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  // Control opcional desde la pantalla: evita que un detalle quede "pegado"
  // a otra tarea cuando cambian los filtros. Sin estas props la tarjeta
  // se comporta como componente no controlado (útil en pruebas aisladas).
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
};

const priorityStyle: Record<TaskPriority, { bg: string; fg: string }> = {
  alta: { bg: colors.destructiveSoft, fg: colors.destructive },
  media: { bg: colors.warningSoft, fg: colors.warning },
  baja: { bg: colors.primarySoft, fg: colors.primary },
};

export function TaskCard({ task, onToggle, onDelete, expanded: controlledExpanded, onExpandChange }: TaskCardProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const expanded = controlledExpanded ?? localExpanded;

  function toggleExpanded() {
    const next = !expanded;
    setLocalExpanded(next);
    onExpandChange?.(next);
  }

  const priority = priorityStyle[task.priority];

  return (
    <View
      style={[styles.card, task.completed && styles.cardCompleted]}
      testID={`card-${task.id}`}
      accessibilityState={{ selected: task.completed }}
    >
      <View style={styles.topLine}>
        <Pressable
          testID={`toggle-${task.id}`}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.completed }}
          accessibilityLabel={task.completed ? `Marcar ${task.title} como pendiente` : `Marcar ${task.title} como completada`}
          hitSlop={touch.hitSlop}
          android_ripple={{ color: colors.primarySoft, borderless: true }}
          onPress={onToggle}
          style={({ pressed }) => [
            styles.check,
            task.completed && styles.checked,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.checkText, task.completed && styles.checkTextOn]}>{task.completed ? '✓' : ''}</Text>
        </Pressable>

        <View style={styles.content}>
          <Text style={[styles.title, task.completed && styles.completed]}>{task.title}</Text>
          <View style={styles.row}>
            <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
              <Text style={[styles.priorityText, { color: priority.fg }]}>{task.priority.toUpperCase()}</Text>
            </View>
            {task.completed ? (
              <View style={styles.doneBadge}>
                <Text style={styles.doneBadgeText}>✓ COMPLETADA</Text>
              </View>
            ) : (
              <>
                <Text style={styles.dividerText}>·</Text>
                <Text style={styles.state}>Pendiente</Text>
              </>
            )}
          </View>
        </View>

        <Pressable
          testID={`expand-${task.id}`}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={`Ver detalle de ${task.title}`}
          hitSlop={touch.hitSlop}
          onPress={toggleExpanded}
          style={({ pressed }) => [styles.expandButton, pressed && styles.pressed]}
        >
          <Text style={styles.expandText}>{expanded ? '−' : '+'}</Text>
        </Pressable>
      </View>

      {expanded ? (
        <View style={styles.details} testID={`details-${task.id}`}>
          <Text style={styles.description}>{task.description}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${task.title}`}
            hitSlop={touch.hitSlop}
            onPress={onDelete}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
          >
            <Text style={styles.deleteText}>Eliminar tarea</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cardCompleted: {
    borderLeftColor: colors.primaryStrong,
    backgroundColor: colors.primarySurface,
    borderColor: colors.border,
  },
  topLine: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  check: {
    height: 30,
    width: 30,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: colors.primaryStrong,
    borderColor: colors.primaryStrong,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 0,
  },
  checkText: { color: 'transparent', fontWeight: '900', fontSize: 18, lineHeight: 20 },
  checkTextOn: { color: colors.onPrimary },
  content: { flex: 1 },
  title: { color: colors.foreground, fontSize: 15, fontWeight: '700', lineHeight: 21 },
  completed: { color: colors.textMuted, textDecorationLine: 'line-through', opacity: 0.85 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 7, flexWrap: 'wrap' },
  priorityBadge: { paddingHorizontal: space.sm, paddingVertical: 3, borderRadius: radius.pill },
  priorityText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  dividerText: { color: colors.textSubtle, fontSize: 11 },
  state: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  doneBadgeText: { color: colors.onPrimary, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  expandButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.primarySurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandText: { color: colors.primary, fontWeight: '800', fontSize: 20 },
  details: {
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  description: { ...type.body, color: colors.textMuted },
  deleteButton: {
    alignSelf: 'flex-start',
    marginTop: space.md,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    minHeight: 36,
    backgroundColor: colors.destructiveSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.destructive,
  },
  deleteText: { color: colors.destructive, fontSize: 12, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
