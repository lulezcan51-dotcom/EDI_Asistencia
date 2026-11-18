import { useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator, FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { AddTaskSheet, type NewTaskDraft } from '../src/components/AddTaskSheet';
import { AdminPanel } from '../src/components/AdminPanel';
import { StatusTabs } from '../src/components/StatusTabs';
import { TaskCard } from '../src/components/TaskCard';
import { fetchTasks } from '../src/services/taskService';
import { colors, radius, space, touch, type as typeTokens } from '../src/theme/tokens';
import type { Task, TaskStatus } from '../src/types/task';
import {
  clearCompleted, completeAll, filterByPriority, getPriorityCounts, sortTasks,
  type PriorityFilter, type TaskSort,
} from '../src/utils/taskAdmin';
import { filterTasks } from '../src/utils/taskFilters';
import { isValidTaskTitle } from '../src/utils/taskValidation';

export default function TaskManagerScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todas');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('todas');
  const [sort, setSort] = useState<TaskSort>('default');
  const [newTitle, setNewTitle] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const nextId = useRef(100);

  async function loadTasks(simulateFailure = false) {
    setLoading(true);
    setError(null);
    try {
      const records = await fetchTasks(simulateFailure);
      setTasks(records);
      setLoading(false);
    } catch (caught) {
      console.error('[taskService] No se cargaron las tareas', caught);
      setError('No pudimos cargar las tareas. Probá otra vez.');
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  // Al cambiar cualquier filtro u orden se colapsa el detalle: evita que un
  // "expandido" quede asociado a otra tarea (incidencia 6 de la guía).
  useEffect(() => {
    setExpandedId(null);
  }, [status, priorityFilter, query, sort]);

  const visibleTasks = useMemo(() => {
    const ordered = sortTasks(tasks, sort);
    const byPriority = filterByPriority(ordered, priorityFilter);
    return filterTasks(byPriority, query, status);
  }, [tasks, query, status, priorityFilter, sort]);

  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const counts = useMemo(() => getPriorityCounts(tasks), [tasks]);

  function toggleTask(id: string) {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  function addTask() {
    if (!isValidTaskTitle(newTitle)) {
      setFeedback('Ingresá un nombre válido para continuar.');
      return;
    }
    const task: Task = {
      id: `nuevo-${nextId.current++}`,
      title: newTitle.trim(),
      description: 'Tarea creada durante el taller de debugging.',
      priority: 'media',
      completed: false,
    };
    setTasks((previous) => [task, ...previous]);
    setNewTitle('');
    setFeedback('Tarea agregada.');
    Keyboard.dismiss();
  }

  function handleSheetSubmit(draft: NewTaskDraft) {
    const task: Task = {
      id: `nuevo-${nextId.current++}`,
      title: draft.title,
      description: draft.description || 'Sin descripción.',
      priority: draft.priority,
      completed: false,
    };
    setTasks((previous) => [task, ...previous]);
    setFeedback(`Tarea "${draft.title}" agregada (prioridad ${draft.priority}).`);
  }

  function deleteTask(id: string) {
    setTasks((previous) => previous.filter((task) => task.id !== id));
    setFeedback('Tarea eliminada.');
  }

  function handleCompleteAll() {
    if (total === 0) return;
    setTasks(completeAll);
    setFeedback('Todas las tareas quedaron completadas.');
  }

  function handleClearCompleted() {
    const removed = completed;
    setTasks(clearCompleted);
    setFeedback(removed > 0 ? `Se eliminaron ${removed} completadas.` : 'No había tareas completadas.');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={loading ? [] : visibleTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            expanded={expandedId === item.id}
            onExpandChange={(next) => setExpandedId(next ? item.id : null)}
            onToggle={() => toggleTask(item.id)}
            onDelete={() => deleteTask(item.id)}
          />
        )}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <>
            <View style={styles.eyebrowRow}>
              <Text style={styles.eyebrow}>LABORATORIO · REACT NATIVE</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Abrir guía de trabajo"
                hitSlop={touch.hitSlop}
                onPress={() => router.push('/guia')}
                style={({ pressed }) => [styles.helpButton, pressed && styles.pressed]}
              >
                <Text style={styles.helpText}>Guía ↗</Text>
              </Pressable>
            </View>

            <Text style={styles.heading}>Gestor de tareas</Text>
            <Text style={styles.subtitle}>Organizá, filtrá y administrá tus tareas en un solo lugar.</Text>

            <View style={styles.statsRow}>
              <View style={[styles.stat, styles.statDark]}>
                <Text style={styles.statLabelLight}>TAREAS</Text>
                <Text style={styles.statNumberLight}>{total}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>COMPLETADAS</Text>
                <Text style={styles.statNumber}>{completed}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>PENDIENTES</Text>
                <Text style={styles.statNumber}>{total - completed}</Text>
              </View>
            </View>

            <Text style={styles.label}>NUEVA TAREA</Text>
            <View style={styles.addRow}>
              <TextInput
                testID="new-task-input"
                accessibilityLabel="Nombre de la nueva tarea"
                placeholder="Ej.: Revisar documentación"
                placeholderTextColor={colors.textSubtle}
                value={newTitle}
                onChangeText={setNewTitle}
                returnKeyType="done"
                onSubmitEditing={addTask}
                style={styles.addInput}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Agregar tarea"
                testID="add-task-button"
                hitSlop={touch.hitSlop}
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
                onPress={addTask}
              >
                <Text style={styles.addButtonText}>Agregar</Text>
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir formulario completo para agregar tarea"
              testID="open-add-sheet"
              hitSlop={touch.hitSlop}
              onPress={() => setSheetVisible(true)}
              style={({ pressed }) => [styles.moreOptions, pressed && styles.pressed]}
            >
              <Text style={styles.moreOptionsText}>＋ Agregar con detalles (prioridad y descripción)</Text>
            </Pressable>
            {feedback ? <Text accessibilityLiveRegion="polite" style={styles.feedback}>{feedback}</Text> : null}

            <Text style={[styles.label, styles.sectionHeading]}>MIS TAREAS</Text>
            <View style={styles.searchWrap}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                testID="search-input"
                accessibilityLabel="Buscar tareas"
                placeholder="Buscar por nombre..."
                placeholderTextColor={colors.textSubtle}
                value={query}
                onChangeText={setQuery}
                style={styles.searchInput}
              />
            </View>
            <StatusTabs current={status} onChange={setStatus} />

            <AdminPanel
              taskCount={total}
              priorityFilter={priorityFilter}
              onPriorityFilter={setPriorityFilter}
              sort={sort}
              onSort={setSort}
              onCompleteAll={handleCompleteAll}
              onClearCompleted={handleClearCompleted}
              counts={counts}
            />

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Recargar datos"
                hitSlop={touch.hitSlop}
                style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                onPress={() => void loadTasks()}
              >
                <Text style={styles.retryLabel}>↻ Recargar datos</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Simular error de API"
                testID="simulate-error-button"
                hitSlop={touch.hitSlop}
                style={({ pressed }) => [styles.simulateButton, pressed && styles.pressed]}
                onPress={() => void loadTasks(true)}
              >
                <Text style={styles.simulateLabel}>⚠ Simular error API</Text>
              </Pressable>
            </View>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            {loading ? (
              <View style={styles.loading}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.loadingLabel}>Consultando tareas…</Text>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>◷</Text>
            <Text style={styles.emptyTitle}>No hay tareas para mostrar</Text>
            <Text style={styles.emptyText}>Probá con otros filtros o agregá una tarea nueva.</Text>
          </View>
        ) : null}
        ListFooterComponent={<Text style={styles.footer}>EDI · Desarrollo de Software Multiplataforma · Auditoría técnica</Text>}
      />
      <AddTaskSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSubmit={handleSheetSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  listContainer: { paddingHorizontal: space.xl - 1, paddingTop: space.xxl - 6, paddingBottom: 60, flexGrow: 1 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { ...typeTokens.eyebrow, color: colors.primary },
  helpButton: {
    backgroundColor: colors.primarySoft,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    minHeight: 36,
    justifyContent: 'center',
  },
  helpText: { fontWeight: '800', color: colors.primaryStrong, fontSize: 12 },
  heading: { ...typeTokens.heading, color: colors.foreground, marginTop: space.md },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: space.sm, marginBottom: space.xxl, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.xxl },
  stat: {
    backgroundColor: colors.surface,
    padding: space.md,
    borderRadius: radius.lg,
    flex: 1,
    borderColor: colors.borderSoft,
    borderWidth: 1,
  },
  statDark: { backgroundColor: colors.primaryStrong, borderColor: colors.primaryStrong },
  statLabel: { fontWeight: '800', color: colors.textSubtle, fontSize: 8, letterSpacing: 0.4 },
  statLabelLight: { fontWeight: '800', color: colors.primarySoft, fontSize: 8, letterSpacing: 0.4 },
  statNumber: { marginTop: space.sm, color: colors.foreground, fontWeight: '800', fontSize: 24 },
  statNumberLight: { marginTop: space.sm, color: colors.onPrimary, fontWeight: '800', fontSize: 24 },
  label: { ...typeTokens.section, color: colors.foreground, marginBottom: space.md },
  sectionHeading: { marginTop: space.xl },
  addRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.sm },
  addInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    color: colors.text,
    fontSize: 14,
    minWidth: 0,
    minHeight: touch.minTarget,
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: touch.minTarget,
  },
  addButtonText: { color: colors.onPrimary, fontWeight: '800', fontSize: 13 },
  moreOptions: {
    alignSelf: 'flex-start',
    paddingVertical: space.sm,
    minHeight: 30,
    marginBottom: space.xs,
  },
  moreOptionsText: { color: colors.primaryStrong, fontSize: 12, fontWeight: '800' },
  feedback: { color: colors.primary, fontSize: 12, fontWeight: '700', marginBottom: space.sm },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    marginBottom: space.md,
    paddingHorizontal: space.md,
  },
  searchIcon: { color: colors.primary, fontSize: 20, marginRight: space.sm },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: space.md,
    minHeight: touch.minTarget,
  },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm, marginBottom: space.md },
  retryButton: {
    paddingVertical: space.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    flex: 1,
    alignItems: 'center',
    minHeight: touch.minTarget,
    justifyContent: 'center',
  },
  retryLabel: { fontSize: 12, color: colors.primaryStrong, fontWeight: '800' },
  simulateButton: {
    paddingVertical: space.md,
    backgroundColor: colors.destructiveSoft,
    borderRadius: radius.md,
    flex: 1,
    alignItems: 'center',
    minHeight: touch.minTarget,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.destructive,
  },
  simulateLabel: { fontSize: 12, color: colors.destructive, fontWeight: '800' },
  error: {
    color: colors.destructive,
    backgroundColor: colors.destructiveSoft,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.destructive,
    fontWeight: '700',
    marginBottom: space.md,
    fontSize: 12,
  },
  loading: { alignItems: 'center', paddingTop: space.xxl, paddingBottom: space.lg, gap: space.md },
  loadingLabel: { color: colors.textMuted, fontSize: 12 },
  empty: { alignItems: 'center', marginTop: space.xxxl, paddingHorizontal: space.xl },
  emptyIcon: { fontSize: 34, color: colors.primary, marginBottom: space.md },
  emptyTitle: { color: colors.foreground, fontWeight: '800', fontSize: 15 },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: space.sm },
  footer: { textAlign: 'center', color: colors.textSubtle, fontSize: 10, paddingTop: space.xxxl },
  pressed: { opacity: 0.7 },
});
