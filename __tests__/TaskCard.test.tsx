import { fireEvent, render } from '@testing-library/react-native';
import { TaskCard } from '../src/components/TaskCard';
import type { Task } from '../src/types/task';

const base: Task = {
  id: 1,
  title: 'Probar navegación',
  description: 'Abrir un detalle.',
  createdAt: '2026-11-25T10:00:00.000Z',
  priority: 'alta',
  completed: false,
};

describe('TaskCard', () => {
  it('permite completar una tarea', () => {
    const onToggle = jest.fn();
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <TaskCard task={base} onToggle={onToggle} onDelete={onDelete} />,
    );
    fireEvent.press(getByTestId('toggle-1'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
  it('muestra el detalle al expandir una tarjeta', () => {
    const { getByTestId } = render(
      <TaskCard task={{ ...base, id: 2, title: 'Auditar tareas', priority: 'media' }} onToggle={() => undefined} onDelete={() => undefined} />,
    );
    fireEvent.press(getByTestId('expand-2'));
    expect(getByTestId('details-2')).toBeTruthy();
  });
  it('respeta el estado expandido controlado por el padre', () => {
    const task = { ...base, id: 3, title: 'Controlada', description: 'Detalle.', priority: 'baja' as const };
    const { getByTestId, queryByTestId, rerender } = render(
      <TaskCard task={task} expanded={false} onExpandChange={() => undefined} onToggle={() => undefined} onDelete={() => undefined} />,
    );
    fireEvent.press(getByTestId('expand-3'));
    expect(queryByTestId('details-3')).toBeNull();
    rerender(
      <TaskCard task={task} expanded onExpandChange={() => undefined} onToggle={() => undefined} onDelete={() => undefined} />,
    );
    expect(getByTestId('details-3')).toBeTruthy();
  });
  it('bloquea los controles mientras la tarjeta está ocupada', () => {
    const onToggle = jest.fn();
    const { getByTestId } = render(
      <TaskCard task={base} busy onToggle={onToggle} onDelete={() => undefined} />,
    );
    fireEvent.press(getByTestId('toggle-1'));
    expect(onToggle).not.toHaveBeenCalled();
  });
});
