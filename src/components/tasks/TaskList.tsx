import { ReactElement, useEffect, useRef } from 'react';
import { Animated, FlatList, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space } from '../../theme/tokens';
import { type } from '../../theme/typography';
import type { Task } from '../../types/task';
import { Icon } from '../ui/Icon';
import { TaskCard } from './TaskCard';

type Props = {
  tasks: Task[];
  header: ReactElement | null;
  loading: boolean;
  busy: Set<number>;
  expandedId: number | null;
  onExpandChange: (id: number | null) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
};

export function TaskList({ tasks, header, loading, busy, expandedId, onExpandChange, onToggle, onDelete, onRefresh }: Props) {
  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item, index }) => (
        <TaskCard
          task={item}
          index={index}
          busy={busy.has(item.id)}
          expanded={expandedId === item.id}
          onExpandChange={(next) => onExpandChange(next ? item.id : null)}
          onToggle={() => onToggle(item.id)}
          onDelete={() => onDelete(item.id)}
        />
      )}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.container}
      ListHeaderComponent={header}
      onRefresh={onRefresh}
      refreshing={loading && tasks.length === 0}
      ListEmptyComponent={loading ? <Skeleton /> : <EmptyState />}
      ListFooterComponent={<Text style={styles.footer}>EDI · Desarrollo de Software Multiplataforma</Text>}
    />
  );
}

function Skeleton() {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View style={{ opacity }}>
      {[0, 1, 2].map((key) => (
        <View key={key} style={styles.skeleton}>
          <View style={styles.skeletonBox} />
          <View style={styles.skeletonLines}>
            <View style={[styles.skeletonLine, { width: '65%' }]} />
            <View style={[styles.skeletonLine, { width: '38%' }]} />
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}><Icon name="inbox" size={24} color={colors.muted} /></View>
      <Text style={styles.emptyTitle}>Nada por aquí</Text>
      <Text style={styles.emptyText}>No hay tareas con estos filtros. Probá otra búsqueda o creá una.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48, flexGrow: 1 },
  skeleton: { flexDirection: 'row', gap: space.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: space.lg, marginBottom: space.sm },
  skeletonBox: { width: 22, height: 22, borderRadius: radius.xs, backgroundColor: colors.line },
  skeletonLines: { flex: 1, gap: 8 },
  skeletonLine: { height: 8, borderRadius: 4, backgroundColor: colors.line },
  empty: { alignItems: 'center', paddingVertical: space.xxxl, paddingHorizontal: space.xl },
  emptyIcon: { width: 48, height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, marginBottom: space.lg },
  emptyTitle: { ...type.title, color: colors.ink },
  emptyText: { ...type.body, color: colors.muted, textAlign: 'center', marginTop: space.sm, maxWidth: 280 },
  footer: { ...type.eyebrow, textAlign: 'center', color: colors.faint, paddingTop: space.xxxl },
});
