import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, touch } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { useEntrance, usePulse, useReduceMotion } from '../../theme/motion';
import type { Task, TaskPriority } from '../../types/task';
import { Icon } from '../ui/Icon';
import { Badge, IconButton } from '../ui/Primitives';

type Props = {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  busy?: boolean;
  index?: number;
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
};

const tone: Record<TaskPriority, 'high' | 'mid' | 'low'> = {
  alta: 'high', media: 'mid', baja: 'low',
};

export function TaskCard({ task, onToggle, onDelete, onEdit, busy = false, index = 0, expanded: controlled, onExpandChange }: Props) {
  const reduce = useReduceMotion();
  const entrance = useEntrance(index, reduce);
  const check = usePulse(reduce);
  const [localExpanded, setLocalExpanded] = useState(false);
  const expanded = controlled ?? localExpanded;

  useEffect(() => {
    if (task.completed) check.pulse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.completed]);

  function toggleExpanded() {
    const next = !expanded;
    setLocalExpanded(next);
    onExpandChange?.(next);
  }

  return (
    <Animated.View style={[styles.card, entrance, task.completed && styles.cardDone]} testID={`card-${task.id}`}>
      <View style={styles.row}>
        <Animated.View style={{ transform: [{ scale: check.scale }] }}>
          <Pressable
            testID={`toggle-${task.id}`}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: task.completed }}
            accessibilityLabel={task.completed ? `Marcar ${task.title} como pendiente` : `Marcar ${task.title} como completada`}
            disabled={busy}
            hitSlop={touch.hitSlop}
            onPress={onToggle}
            style={[styles.checkbox, task.completed && styles.checkboxOn]}
          >
            {task.completed ? <Icon name="check" size={15} color={colors.onAccent} /> : null}
          </Pressable>
        </Animated.View>

        <View style={styles.body}>
          <Text style={[styles.title, task.completed && styles.titleDone]}>{task.title}</Text>
          <View style={styles.meta}>
            <Badge label={task.priority.toUpperCase()} tone={tone[task.priority]} />
            {task.completed ? (
              <Badge label="COMPLETADA" tone="done" />
            ) : (
              <Text style={styles.state}>Pendiente</Text>
            )}
            {busy ? <Text style={styles.busy}>Guardando</Text> : null}
          </View>
        </View>

        <IconButton
          name={expanded ? 'minus' : 'plus'}
          label={expanded ? 'Contraer detalle' : 'Expandir detalle'}
          testID={`expand-${task.id}`}
          onPress={toggleExpanded}
        />
      </View>

      {expanded ? (
        <View style={styles.detail} testID={`details-${task.id}`}>
          <Text style={styles.description}>{task.description || 'Sin descripción.'}</Text>
          <View style={styles.date}>
            <Icon name="calendar" size={13} color={colors.faint} />
            <Text style={styles.dateText}>{new Date(task.createdAt).toLocaleString()}</Text>
          </View>
          <View style={styles.detailActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Editar ${task.title}`}
              testID={`edit-${task.id}`}
              disabled={busy}
              hitSlop={touch.hitSlop}
              onPress={onEdit}
              style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            >
              <Icon name="edit" size={14} color={colors.ink} />
              <Text style={styles.actionText}>Editar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Eliminar ${task.title}`}
              disabled={busy}
              hitSlop={touch.hitSlop}
              onPress={onDelete}
              style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            >
              <Icon name="trash" size={14} color={colors.highFg} />
              <Text style={[styles.actionText, styles.deleteText]}>Eliminar</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
    marginBottom: space.sm,
  },
  cardDone: { backgroundColor: colors.surfaceAlt },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  checkbox: {
    width: 22, height: 22, borderRadius: radius.sm,
    borderWidth: 1.5, borderColor: colors.lineStrong,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  body: { flex: 1 },
  title: { ...type.title, color: colors.ink, marginTop: 1 },
  titleDone: { color: colors.faint, textDecorationLine: 'line-through' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 10 },
  state: { ...type.meta, color: colors.muted },
  busy: { ...type.meta, color: colors.faint },
  detail: { marginTop: space.lg, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: colors.line },
  description: { ...type.body, color: colors.inkSoft, maxWidth: 520 },
  date: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.md },
  dateText: { ...type.meta, color: colors.faint },
  detailActions: { flexDirection: 'row', gap: space.xl, marginTop: space.lg },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  actionText: { ...type.meta, color: colors.ink },
  deleteText: { color: colors.highFg },
  pressed: { opacity: 0.6 },
});
