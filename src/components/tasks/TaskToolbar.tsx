import { Animated, ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import { useEntrance, useReduceMotion } from '../../theme/motion';
import type { TaskPriority, TaskStatus } from '../../types/task';
import type { PriorityFilter, TaskSort } from '../../utils/taskAdmin';
import { Icon } from '../ui/Icon';
import { Button, TextField } from '../ui/Primitives';
import { AdminPanel } from './AdminPanel';
import { StatusTabs } from './StatusTabs';

type Props = {
  query: string;
  onQuery: (value: string) => void;
  status: TaskStatus;
  onStatus: (value: TaskStatus) => void;
  priorityFilter: PriorityFilter;
  onPriorityFilter: (value: PriorityFilter) => void;
  sort: TaskSort;
  onSort: (value: TaskSort) => void;
  counts: Record<TaskPriority, number>;
  taskCount: number;
  onCompleteAll: () => void;
  onClearCompleted: () => void;
  onReload: () => void;
  onSimulate: () => void;
  error: string | null;
  loading: boolean;
  hasTasks: boolean;
};

export function TaskToolbar({
  query, onQuery, status, onStatus, priorityFilter, onPriorityFilter, sort, onSort,
  counts, taskCount, onCompleteAll, onClearCompleted, onReload, onSimulate, error, loading, hasTasks,
}: Props) {
  const reduce = useReduceMotion();
  const entrance = useEntrance(2, reduce);

  return (
    <Animated.View style={entrance}>
      <Text style={styles.label}>Mis tareas</Text>
      <TextField value={query} onChangeText={onQuery} placeholder="Buscar por título o descripción" label="Buscar tareas" testID="search-input" leading="search" />

      <View style={styles.tabsWrap}>
        <StatusTabs current={status} onChange={onStatus} />
      </View>

      <AdminPanel
        taskCount={taskCount}
        priorityFilter={priorityFilter}
        onPriorityFilter={onPriorityFilter}
        sort={sort}
        onSort={onSort}
        onCompleteAll={onCompleteAll}
        onClearCompleted={onClearCompleted}
        counts={counts}
      />

      <View style={styles.services}>
        <Button label="Recargar datos" icon="reload" variant="ghost" onPress={onReload} flex />
        <Button label="Simular error" icon="alert" variant="ghost" onPress={onSimulate} flex />
      </View>

      {error ? (
        <View style={styles.error} accessibilityRole="alert">
          <Icon name="alert" size={16} color={colors.highFg} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading && hasTasks ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.muted} size="small" />
          <Text style={styles.loadingText}>Actualizando</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  label: { ...type.eyebrow, marginBottom: space.md },
  tabsWrap: { marginTop: space.xl },
  services: { flexDirection: 'row', gap: space.sm },
  error: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start', padding: space.md, borderWidth: 1, borderColor: colors.highFg, borderRadius: 10, marginTop: space.md },
  errorText: { ...type.meta, color: colors.highFg, flex: 1, lineHeight: 17 },
  loading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingVertical: space.lg },
  loadingText: { ...type.meta, color: colors.muted },
});
