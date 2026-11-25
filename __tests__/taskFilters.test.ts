import { filterTasks } from '../src/utils/taskFilters';
import type { Task } from '../src/types/task';

const demo: Task[] = [
  { id: 1, title: 'Validar login', description: '', createdAt: '2026-11-25T10:00:00.000Z', completed: false, priority: 'media' },
  { id: 2, title: 'Corregir navegación', description: '', createdAt: '2026-11-25T10:00:00.000Z', completed: true, priority: 'media' },
  { id: 3, title: 'Revisar validaciones', description: '', createdAt: '2026-11-25T10:00:00.000Z', completed: false, priority: 'media' },
];

describe('filterTasks', () => {
  it('busca sin distinguir entre minúsculas y mayúsculas', () => {
    expect(filterTasks(demo, 'VALIDAR', 'todas')).toHaveLength(1);
  });
  it('ignora espacios antes y después de la búsqueda', () => {
    expect(filterTasks(demo, '  login  ', 'todas')).toHaveLength(1);
  });
  it('filtra pendientes', () => {
    expect(filterTasks(demo, '', 'pendientes')).toHaveLength(2);
  });
  it('filtra completadas', () => {
    expect(filterTasks(demo, '', 'completadas')).toHaveLength(1);
  });
});
