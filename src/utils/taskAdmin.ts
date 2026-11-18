import type { Task, TaskPriority } from '../types/task';

export type TaskSort = 'default' | 'priority' | 'title' | 'status';
export type PriorityFilter = TaskPriority | 'todas';

const priorityWeight: Record<TaskPriority, number> = { alta: 0, media: 1, baja: 2 };

/** Ordena sin mutar el array original. */
export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const copy = [...tasks];
  if (sort === 'priority') {
    return copy.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);
  }
  if (sort === 'title') {
    return copy.sort((a, b) => a.title.localeCompare(b.title, 'es'));
  }
  if (sort === 'status') {
    return copy.sort((a, b) => Number(a.completed) - Number(b.completed));
  }
  return copy;
}

/** Filtra por prioridad sin mutar. */
export function filterByPriority(tasks: Task[], priority: PriorityFilter): Task[] {
  if (priority === 'todas') return tasks;
  return tasks.filter((task) => task.priority === priority);
}

/** Acciones en lote: devuelven un array nuevo. */
export function completeAll(tasks: Task[]): Task[] {
  return tasks.map((task) => ({ ...task, completed: true }));
}

export function clearCompleted(tasks: Task[]): Task[] {
  return tasks.filter((task) => !task.completed);
}

export function getPriorityCounts(tasks: Task[]): Record<TaskPriority, number> {
  return tasks.reduce<Record<TaskPriority, number>>(
    (counts, task) => {
      counts[task.priority] += 1;
      return counts;
    },
    { alta: 0, media: 0, baja: 0 }
  );
}
