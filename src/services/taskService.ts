import type { CreateTaskInput, Task, TaskFilters, TaskStatus } from '../types/task';

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
).replace(/\/+$/, '');

/** Error HTTP con código y mensaje, para distinguir 400/404/500 en la UI. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const apiStatus: Record<TaskStatus, string> = {
  todas: 'all',
  pendientes: 'pending',
  completadas: 'completed',
};

/**
 * Ejecuta fetch, lee la respuesta como texto y la convierte a JSON cuando
 * corresponde. Un 204 con cuerpo vacío resuelve como undefined.
 */
async function request<T>(path: string, init?: RequestInit, signal?: AbortSignal): Promise<T> {
  const hasBody = init?.body !== undefined;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (hasBody) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
      signal: signal ?? init?.signal,
    });
  } catch (caught) {
    if ((caught as Error)?.name === 'AbortError') throw caught;
    throw new ApiError(0, 'No se pudo conectar con el servidor.');
  }

  const text = await response.text();
  let payload: unknown;
  if (text.length > 0) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const detail =
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : `HTTP ${response.status}`;
    throw new ApiError(response.status, detail);
  }

  return payload as T;
}

function assertId(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, 'El ID de la tarea debe ser un entero positivo.');
  }
}

export const tasksService = {
  /** GET /tasks con búsqueda y estado. Devuelve un array directo (o []). */
  async list(filters: TaskFilters = {}, signal?: AbortSignal): Promise<Task[]> {
    const params = new URLSearchParams();
    const search = filters.search?.trim();
    if (search) params.set('search', search);
    params.set('status', apiStatus[filters.status ?? 'todas']);
    const query = params.toString();
    return request<Task[]>(`/tasks${query ? `?${query}` : ''}`, undefined, signal);
  },

  /** GET /tasks/{id}. El llamador debe manejar un posible 404. */
  async get(id: number, signal?: AbortSignal): Promise<Task> {
    assertId(id);
    return request<Task>(`/tasks/${id}`, undefined, signal);
  },

  /** POST /tasks. El backend genera id, createdAt y el estado inicial. */
  async create(input: CreateTaskInput): Promise<Task> {
    return request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: input.title.trim(),
        ...(input.description !== undefined ? { description: input.description.trim() } : {}),
      }),
    });
  },

  /** PATCH /tasks/{id}: solo cambia `completed`. */
  async setCompleted(id: number, completed: boolean): Promise<Task> {
    assertId(id);
    return request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  },

  /** DELETE /tasks/{id}: 204 sin cuerpo. */
  async remove(id: number): Promise<void> {
    assertId(id);
    return request<void>(`/tasks/${id}`, { method: 'DELETE' });
  },

  /**
   * El contrato no expone PUT ni PATCH de título/descripción (PATCH solo
   * acepta `completed`). Para editar se crea la versión nueva y se elimina
   * la original. Si falla el alta, no se toca la original.
   */
  async replace(id: number, input: CreateTaskInput, completed: boolean): Promise<Task> {
    assertId(id);
    const created = await this.create(input);
    let result = created;
    if (completed) {
      try {
        result = await this.setCompleted(created.id, true);
      } catch (caught) {
        await this.remove(created.id).catch(() => undefined);
        throw caught;
      }
    }
    try {
      await this.remove(id);
    } catch {
      throw new ApiError(409, 'La tarea se creó, pero no se pudo eliminar la original.');
    }
    return result;
  },
};

/**
 * Compatibilidad con la pantalla anterior y el botón «Simular error API».
 * Sin simulación delega en tasksService.list; con simulación lanza un 503
 * sintético sin realizar ninguna petición.
 */
export async function fetchTasks(simulateFailure = false): Promise<Task[]> {
  if (simulateFailure) {
    throw new ApiError(503, 'HTTP 503: servidor temporalmente indisponible (simulado)');
  }
  return tasksService.list();
}
