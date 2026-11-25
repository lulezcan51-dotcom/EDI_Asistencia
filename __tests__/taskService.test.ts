import { ApiError, tasksService } from '../src/services/taskService';
import type { Task } from '../src/types/task';

const sample: Task = {
  id: 1,
  title: 'Prueba',
  description: '',
  createdAt: '2026-11-25T10:00:00.000Z',
  completed: false,
  priority: 'media',
};

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe('tasksService', () => {
  const originalFetch = globalThis.fetch;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('list traduce el estado y codifica la búsqueda', async () => {
    mockFetch.mockResolvedValue(jsonResponse([sample]));
    const result = await tasksService.list({ search: 'unidad 1', status: 'pendientes' });
    expect(result).toEqual([sample]);
    const url = String(mockFetch.mock.calls[0][0]);
    expect(url).toContain('/tasks?');
    expect(url).toContain('search=unidad+1');
    expect(url).toContain('status=pending');
  });

  it('create envía POST con título y descripción', async () => {
    mockFetch.mockResolvedValue(jsonResponse(sample, 201));
    await tasksService.create({ title: '  Prueba  ', description: ' detalle ' });
    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/tasks');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ title: 'Prueba', description: 'detalle' });
  });

  it('setCompleted envía el booleano sin comillas', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ ...sample, completed: true }));
    const updated = await tasksService.setCompleted(1, true);
    expect(updated.completed).toBe(true);
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ completed: true });
  });

  it('remove acepta un 204 sin cuerpo', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, text: async () => '' } as Response);
    await expect(tasksService.remove(1)).resolves.toBeUndefined();
    expect(mockFetch.mock.calls[0][1].method).toBe('DELETE');
  });

  it('lanza ApiError con el código HTTP', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: 'No encontrada' }, 404));
    await expect(tasksService.get(99)).rejects.toMatchObject({ status: 404, message: 'No encontrada' });
  });

  it('rechaza IDs inválidos antes de pedir', async () => {
    await expect(tasksService.remove(0)).rejects.toBeInstanceOf(ApiError);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
