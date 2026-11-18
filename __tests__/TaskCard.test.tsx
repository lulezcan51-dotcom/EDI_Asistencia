import { fireEvent, render } from '@testing-library/react-native';
import { TaskCard } from '../src/components/TaskCard';

describe('TaskCard', () => {
  it('permite completar una tarea', () => {
    const onToggle = jest.fn();
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <TaskCard
        task={{ id: 't1', title: 'Probar navegación', description: 'Abrir un detalle.', priority: 'alta', completed: false }}
        onToggle={onToggle}
        onDelete={onDelete}
      />,
    );
    fireEvent.press(getByTestId('toggle-t1'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
  it('muestra el detalle al expandir una tarjeta', () => {
    const { getByTestId } = render(
      <TaskCard
        task={{ id: 't2', title: 'Auditar tareas', description: 'Revisar evidencia.', priority: 'media', completed: false }}
        onToggle={() => undefined}
        onDelete={() => undefined}
      />,
    );
    fireEvent.press(getByTestId('expand-t2'));
    expect(getByTestId('details-t2')).toBeTruthy();
  });
  it('respeta el estado expandido controlado por el padre', () => {
    const task = { id: 't3', title: 'Controlada', description: 'Detalle.', priority: 'baja' as const, completed: false };
    const { getByTestId, queryByTestId, rerender } = render(
      <TaskCard task={task} expanded={false} onExpandChange={() => undefined} onToggle={() => undefined} onDelete={() => undefined} />,
    );
    fireEvent.press(getByTestId('expand-t3'));
    expect(queryByTestId('details-t3')).toBeNull();
    rerender(
      <TaskCard task={task} expanded onExpandChange={() => undefined} onToggle={() => undefined} onDelete={() => undefined} />,
    );
    expect(getByTestId('details-t3')).toBeTruthy();
  });
});
