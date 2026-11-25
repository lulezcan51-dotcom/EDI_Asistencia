import type { Task } from '../src/types/task';
import {
  clearCompleted, completeAll, filterByPriority, getPriorityCounts, sortTasks,
} from '../src/utils/taskAdmin';

const demo: Task[] = [
  { id: 1, title: 'Zeta', description: '', createdAt: '2026-11-25T10:00:00.000Z', completed: true, priority: 'baja' },
  { id: 2, title: 'Alfa', description: '', createdAt: '2026-11-25T10:00:00.000Z', completed: false, priority: 'alta' },
  { id: 3, title: 'Media', description: '', createdAt: '2026-11-25T10:00:00.000Z', completed: false, priority: 'media' },
];

describe('taskAdmin', () => {
  it('ordena por prioridad sin mutar el original', () => {
    const result = sortTasks(demo, 'priority');
    expect(result.map((task) => task.priority)).toEqual(['alta', 'media', 'baja']);
    expect(demo[0].title).toBe('Zeta');
  });

  it('ordena por título', () => {
    expect(sortTasks(demo, 'title').map((task) => task.title)).toEqual(['Alfa', 'Media', 'Zeta']);
  });

  it('ordena por estado: pendientes primero', () => {
    expect(sortTasks(demo, 'status').map((task) => task.completed)).toEqual([false, false, true]);
  });

  it('filtra por prioridad', () => {
    expect(filterByPriority(demo, 'alta').map((task) => task.id)).toEqual([2]);
    expect(filterByPriority(demo, 'todas')).toHaveLength(3);
  });

  it('completar todas no muta el original', () => {
    const result = completeAll(demo);
    expect(result.every((task) => task.completed)).toBe(true);
    expect(demo[1].completed).toBe(false);
  });

  it('limpiar completadas devuelve solo pendientes', () => {
    expect(clearCompleted(demo).map((task) => task.id)).toEqual([2, 3]);
  });

  it('cuenta por prioridad', () => {
    expect(getPriorityCounts(demo)).toEqual({ alta: 1, media: 1, baja: 1 });
  });
});
