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
import { ApiError, tasksService } from '../src/services/taskService';
import { colors, radius, space, touch, type as typeTokens } from '../src/theme/tokens';
import type { Task, TaskStatus } from '../src/types/task';
import {
  clearCompleted, completeAll, filterByPriority, getPriorityCounts, sortTasks,
  type PriorityFilter, type TaskSort,
} from '../src/utils/taskAdmin';
import { isValidTaskDescription, isValidTaskTitle } from '../src/utils/taskValidation';

const SEARCH_DEBOUNCE_MS = 275;

function messageFor(caught: unknown): string {
  if (caught instanceof ApiError) return caught.message;
  if (caught instanceof Error) return caught.name === 'AbortError' ? 'Consulta cancelada.' : caught.message;
  return 'Ocurrió un error inesperado.';
}

export default function TaskManagerScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todas');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('todas');
  const [sort, setSort] = useState<TaskSort>('default');
  const [newTitle, setNewTitle] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const filtersRef = useRef<{ search: string; status: TaskStatus }>({ search: '', status: 'todas' });
  const sequenceRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const creatingRef = useRef(false);
  const firstRunRef = useRef(true);

  /** Carga la lista con los filtros vigentes. Cancela la consulta anterior. */
  async function loadTasks(options?: { preserve?: boolean; simulate?: boolean }) {
    const { preserve = false, simulate = false } = options ?? {};
    const sequence = ++sequenceRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!preserve) setLoading(true);
    setError(null);
    try {
      if (simulate) {
        throw new ApiError(503, 'HTTP 503: servidor temporalmente indisponible (simulado)');
      }
      const records = await tasksService.list(filtersRef.current, controller.signal);
      if (sequence !== sequenceRef.current) return;
      setTasks(records.map((task) => ({ ...task, priority: task.priority ?? 'media' })));
    } catch (caught) {
      if ((caught as Error)?.name === 'AbortError' || sequence !== sequenceRef.current) return;
      setError(`No pudimos cargar las tareas. ${messageFor(caught)}`);
    } finally {
      if (sequence === sequenceRef.current) setLoading(false);
    }
  }

  // Primera carga inmediata; luego consulta con debounce al buscar/filtrar.
  useEffect(() => {
    filtersRef.current = { search: query, status };
    const delay = firstRunRef.current ? 0 : SEARCH_DEBOUNCE_MS;
    firstRunRef.current = false;
    const timer = setTimeout(() => void loadTasks({ preserve: true }), delay);
    return () => clearTimeout(timer);
  }, [query, status]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Colapsa el detalle al cambiar filtros (incidencia 6 de la guía de debugging).
  useEffect(() => {
    setExpandedId(null);
  }, [priorityFilter, sort]);

  /** Ejecuta una mutación, bloquea la tarjeta y recarga con los filtros activos. */
  async function mutate(id: number, operation: () => Promise<unknown>, successMessage: string) {
    if (busy.has(id)) return;
    setBusy((previous) => new Set(previous).add(id));
    try {
      await operation();
      setFeedback(successMessage);
      await loadTasks({ preserve: true });
    } catch (caught) {
      const apiError = caught as ApiError;
      setFeedback(
        apiError.status === 404
          ? 'La tarea ya no existe; se recargará la lista.'
          : `No se pudo completar la operación: ${messageFor(caught)}`
      );
      if (apiError.status === 404) await loadTasks({ preserve: true });
    } finally {
      setBusy((previous) => {
        const next = new Set(previous);
        next.delete(id);
        return next;
      });
    }
  }

  async function toggleTask(id: number) {
    const task = tasks.find((item) => item.id === id);
    if (!task || busy.has(id)) return;
    await mutate(
      id,
      async () => {
        const updated = await tasksService.setCompleted(id, !task.completed);
        setTasks((previous) =>
          previous.map((item) => item.id === id ? { ...updated, priority: item.priority } : item)
        );
      },
      task.completed ? 'Tarea devuelta a pendiente.' : 'Tarea completada.'
    );
  }

  async function deleteTask(id: number) {
    await mutate(id, () => tasksService.remove(id), 'Tarea eliminada.');
    setExpandedId(null);
  }

  async function addTask() {
    if (creatingRef.current || saving) return;
    if (!isValidTaskTitle(newTitle)) {
      setFeedback('Ingresá un nombre válido para continuar.');
      return;
    }
    creatingRef.current = true;
    setSaving(true);
    try {
      await tasksService.create({ title: newTitle.trim() });
      setNewTitle('');
      setFeedback('Tarea agregada.');
      await loadTasks({ preserve: true });
    } catch (caught) {
      setFeedback(`No se pudo crear la tarea: ${messageFor(caught)}`);
    } finally {
      setSaving(false);
      creatingRef.current = false;
    }
  }

  async function handleSheetSubmit(draft: NewTaskDraft) {
    if (creatingRef.current || saving) return;
    if (!isValidTaskTitle(draft.title)) {
      setFeedback('Ingresá un nombre válido para continuar.');
      return;
    }
    if (!isValidTaskDescription(draft.description)) {
      setFeedback('La descripción admite hasta 10000 bytes UTF-8.');
      return;
    }
    creatingRef.current = true;
    setSaving(true);
    try {
      // El contrato de la API no incluye `priority`: se conserva solo en la UI.
      const created = await tasksService.create({ title: draft.title, description: draft.description });
      setTasks((previous) => [{ ...created, priority: draft.priority }, ...previous]);
      setFeedback(`Tarea "${draft.title}" agregada (prioridad ${draft.priority}).`);
      await loadTasks({ preserve: true });
    } catch (caught) {
      setFeedback(`No se pudo crear la tarea: ${messageFor(caught)}`);
    } finally {
      setSaving(false);
      creatingRef.current = false;
    }
  }

  // Las acciones en lote son locales: el contrato no expone endpoints bulk.
  function handleCompleteAll() {
    if (tasks.length === 0) return;
    setTasks(completeAll);
    setFeedback('Todas las tareas quedaron completadas en la vista. La API no expone acción en lote.');
  }

  function handleClearCompleted() {
    const removed = tasks.filter((task) => task.completed).length;
    setTasks(clearCompleted);
    setFeedback(removed > 0 ? `Se ocultaron ${removed} completadas de la vista.` : 'No había tareas completadas.');
  }

  // El backend ya filtra por búsqueda y estado; aquí solo ordenamos y agrupamos.
  const visibleTasks = useMemo(() => {
    const ordered = sortTasks(tasks, sort);
    return filterByPriority(ordered, priorityFilter);
  }, [tasks, sort, priorityFilter]);

  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const counts = useMemo(() => getPriorityCounts(tasks), [tasks]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={visibleTasks}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            busy={busy.has(item.id)}
            expanded={expandedId === item.id}
            onExpandChange={(next) => setExpandedId(next ? item.id : null)}
            onToggle={() => void toggleTask(item.id)}
            onDelete={() => void deleteTask(item.id)}
          />
        )}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContainer}
        onRefresh={() => void loadTasks({ preserve: true })}
        refreshing={loading && tasks.length === 0}
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
            <Text style={styles.subtitle}>Tareas compartidas en tiempo real con la API REST.</Text>

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
                onSubmitEditing={() => void addTask()}
                editable={!saving}
                style={styles.addInput}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Agregar tarea"
                testID="add-task-button"
                disabled={saving}
                hitSlop={touch.hitSlop}
                style={({ pressed }) => [styles.addButton, saving && styles.disabled, pressed && styles.pressed]}
                onPress={() => void addTask()}
              >
                {saving ? <ActivityIndicator color={colors.onPrimary} size="small" /> : <Text style={styles.addButtonText}>Agregar</Text>}
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir formulario completo para agregar tarea"
              testID="open-add-sheet"
              disabled={saving}
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
                placeholder="Buscar por nombre o descripción..."
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
                onPress={() => void loadTasks({ preserve: true })}
              >
                <Text style={styles.retryLabel}>↻ Recargar datos</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Simular error de API"
                testID="simulate-error-button"
                hitSlop={touch.hitSlop}
                style={({ pressed }) => [styles.simulateButton, pressed && styles.pressed]}
                onPress={() => void loadTasks({ simulate: true })}
              >
                <Text style={styles.simulateLabel}>⚠ Simular error API</Text>
              </Pressable>
            </View>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            {loading && tasks.length > 0 ? (
              <View style={styles.loadingInline}>
                <ActivityIndicator color={colors.primary} size="small" />
                <Text style={styles.loadingLabel}>Actualizando…</Text>
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
        ListFooterComponent={<Text style={styles.footer}>EDI · Desarrollo de Software Multiplataforma · API REST</Text>}
      />
      <AddTaskSheet
        visible={sheetVisible}
        busy={saving}
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
    backgroundColor: colors.primarySoft, paddingVertical: space.sm, paddingHorizontal: space.md,
    borderRadius: radius.md, minHeight: 36, justifyContent: 'center',
  },
  helpText: { fontWeight: '800', color: colors.primaryStrong, fontSize: 12 },
  heading: { ...typeTokens.heading, color: colors.foreground, marginTop: space.md },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: space.sm, marginBottom: space.xxl, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.xxl },
  stat: { backgroundColor: colors.surface, padding: space.md, borderRadius: radius.lg, flex: 1, borderColor: colors.borderSoft, borderWidth: 1 },
  statDark: { backgroundColor: colors.primaryStrong, borderColor: colors.primaryStrong },
  statLabel: { fontWeight: '800', color: colors.textSubtle, fontSize: 8, letterSpacing: 0.4 },
  statLabelLight: { fontWeight: '800', color: colors.primarySoft, fontSize: 8, letterSpacing: 0.4 },
  statNumber: { marginTop: space.sm, color: colors.foreground, fontWeight: '800', fontSize: 24 },
  statNumberLight: { marginTop: space.sm, color: colors.onPrimary, fontWeight: '800', fontSize: 24 },
  label: { ...typeTokens.section, color: colors.foreground, marginBottom: space.md },
  sectionHeading: { marginTop: space.xl },
  addRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.sm },
  addInput: {
    flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft,
    borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.md,
    color: colors.text, fontSize: 14, minWidth: 0, minHeight: touch.minTarget,
  },
  addButton: {
    backgroundColor: colors.accent, paddingHorizontal: space.lg, borderRadius: radius.md,
    justifyContent: 'center', alignItems: 'center', minHeight: touch.minTarget, minWidth: 84,
  },
  addButtonText: { color: colors.onPrimary, fontWeight: '800', fontSize: 13 },
  moreOptions: { alignSelf: 'flex-start', paddingVertical: space.sm, minHeight: 30, marginBottom: space.xs },
  moreOptionsText: { color: colors.primaryStrong, fontSize: 12, fontWeight: '800' },
  feedback: { color: colors.primary, fontSize: 12, fontWeight: '700', marginBottom: space.sm },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radius.md,
    marginBottom: space.md, paddingHorizontal: space.md,
  },
  searchIcon: { color: colors.primary, fontSize: 20, marginRight: space.sm },
  searchInput: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: space.md, minHeight: touch.minTarget },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm, marginBottom: space.md },
  retryButton: { paddingVertical: space.md, backgroundColor: colors.primarySoft, borderRadius: radius.md, flex: 1, alignItems: 'center', minHeight: touch.minTarget, justifyContent: 'center' },
  retryLabel: { fontSize: 12, color: colors.primaryStrong, fontWeight: '800' },
  simulateButton: {
    paddingVertical: space.md, backgroundColor: colors.destructiveSoft, borderRadius: radius.md,
    flex: 1, alignItems: 'center', minHeight: touch.minTarget, justifyContent: 'center',
    borderWidth: 1, borderColor: colors.destructive,
  },
  simulateLabel: { fontSize: 12, color: colors.destructive, fontWeight: '800' },
  error: {
    color: colors.destructive, backgroundColor: colors.destructiveSoft, padding: space.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.destructive,
    fontWeight: '700', marginBottom: space.md, fontSize: 12,
  },
  loadingInline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingBottom: space.md },
  loadingLabel: { color: colors.textMuted, fontSize: 12 },
  empty: { alignItems: 'center', marginTop: space.xxxl, paddingHorizontal: space.xl },
  emptyIcon: { fontSize: 34, color: colors.primary, marginBottom: space.md },
  emptyTitle: { color: colors.foreground, fontWeight: '800', fontSize: 15 },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: space.sm },
  footer: { textAlign: 'center', color: colors.textSubtle, fontSize: 10, paddingTop: space.xxxl },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.6 },
});
