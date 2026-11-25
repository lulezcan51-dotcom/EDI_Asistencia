export type TaskStatus = 'todas' | 'pendientes' | 'completadas';

/**
 * Contrato de la API REST (/api/v1/tasks).
 * `priority` no es parte del contrato del backend: se mantiene como metadato
 * local opcional para el panel de administración de la interfaz.
 */
export type TaskPriority = 'alta' | 'media' | 'baja';

export type Task = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  completed: boolean;
  priority: TaskPriority;
};

export type TaskFilters = {
  search?: string;
  status?: TaskStatus;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
};
