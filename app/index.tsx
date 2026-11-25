import { useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { AddTaskSheet, type NewTaskDraft } from '../src/components/tasks/AddTaskSheet';
import { TaskComposer } from '../src/components/tasks/TaskComposer';
import { TaskHeader } from '../src/components/tasks/TaskHeader';
import { TaskList } from '../src/components/tasks/TaskList';
import { TaskToolbar } from '../src/components/tasks/TaskToolbar';
import { ApiError, tasksService } from '../src/services/taskService';
import { colors, space } from '../src/theme/tokens';
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

  async function loadTasks(options?: { preserve?: boolean; simulate?: boolean }) {
    const { preserve = false, simulate = false } = options ?? {};
    const sequence = ++sequenceRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!preserve) setLoading(true);
    setError(null);
    try {
      if (simulate) throw new ApiError(503, 'HTTP 503: servidor temporalmente indisponible (simulado)');
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

  useEffect(() => {
    filtersRef.current = { search: query, status };
    const delay = firstRunRef.current ? 0 : SEARCH_DEBOUNCE_MS;
    firstRunRef.current = false;
    const timer = setTimeout(() => void loadTasks({ preserve: true }), delay);
    return () => clearTimeout(timer);
  }, [query, status]);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    setExpandedId(null);
  }, [priorityFilter, sort]);

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
        setTasks((previous) => previous.map((item) => item.id === id ? { ...updated, priority: item.priority } : item));
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

  function handleCompleteAll() {
    if (tasks.length === 0) return;
    setTasks(completeAll);
    setFeedback('Todas las tareas quedaron completadas en la vista.');
  }

  function handleClearCompleted() {
    const removed = tasks.filter((task) => task.completed).length;
    setTasks(clearCompleted);
    setFeedback(removed > 0 ? `Se ocultaron ${removed} completadas de la vista.` : 'No había tareas completadas.');
  }

  const visibleTasks = useMemo(() => filterByPriority(sortTasks(tasks, sort), priorityFilter), [tasks, sort, priorityFilter]);
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const counts = useMemo(() => getPriorityCounts(tasks), [tasks]);

  const header = (
    <View>
      <TaskHeader total={total} completed={completed} onGuide={() => router.push('/guia')} />
      <View style={styles.composer}>
        <TaskComposer
          value={newTitle}
          onChange={setNewTitle}
          onSubmit={() => void addTask()}
          onOpenSheet={() => setSheetVisible(true)}
          saving={saving}
          feedback={feedback}
        />
      </View>
      <TaskToolbar
        query={query}
        onQuery={setQuery}
        status={status}
        onStatus={setStatus}
        priorityFilter={priorityFilter}
        onPriorityFilter={setPriorityFilter}
        sort={sort}
        onSort={setSort}
        counts={counts}
        taskCount={total}
        onCompleteAll={handleCompleteAll}
        onClearCompleted={handleClearCompleted}
        onReload={() => void loadTasks({ preserve: true })}
        onSimulate={() => void loadTasks({ simulate: true })}
        error={error}
        loading={loading}
        hasTasks={tasks.length > 0}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <TaskList
        tasks={visibleTasks}
        header={header}
        loading={loading}
        busy={busy}
        expandedId={expandedId}
        onExpandChange={setExpandedId}
        onToggle={(id) => void toggleTask(id)}
        onDelete={(id) => void deleteTask(id)}
        onRefresh={() => void loadTasks({ preserve: true })}
      />
      <AddTaskSheet visible={sheetVisible} busy={saving} onClose={() => setSheetVisible(false)} onSubmit={handleSheetSubmit} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  composer: { paddingTop: space.lg, borderTopWidth: 1, borderTopColor: colors.line },
});
