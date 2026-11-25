# Integración frontend ↔ API de tareas (Expo SDK 57)

 Implementación basada en la guía «Guía API Tareas Expo Paso a Paso». El proyecto dejó de usar el servicio mock y ahora consume el backend REST real.

## Recorrido de los datos

```
Pantalla (app/index.tsx)
  → tasksService.list/create/setCompleted/remove
  → fetch(EXPO_PUBLIC_API_URL + /tasks...)
  → JSON
  → estado de React
  → tarjetas (TaskCard)
```

El frontend no necesita credenciales de base de datos ni iniciar sesión: las tareas son compartidas.

## Configuración

`.env` (en la raíz, ignorado por Git):

```
EXPO_PUBLIC_API_URL=https://backend-proyecto.n7softwares.com/api/v1
```

El prefijo `EXPO_PUBLIC_` es el que usa Expo. La barra final se elimina con `.replace(/\/+$/, '')`. **No** incluyas `/tasks` ni dupliques `/api/v1`. Tras cambiar `.env`, reiniciá con `npm run start:go -- --clear`.

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `.env` | URL pública del backend |
| `src/types/task.ts` | `Task` (`id: number`, `createdAt`, `completed`) y filtros |
| `src/services/taskService.ts` | `ApiError`, `request<T>` y `tasksService` |
| `src/utils/taskValidation.ts` | Validación en bytes UTF-8 (título ≤ 200, descripción ≤ 10000) |
| `app/index.tsx` | Carga con debounce/AbortController, crear, completar, eliminar |
| `src/components/TaskCard.tsx` | Tarjeta con `busy`, fecha y detalle |
| `src/components/AddTaskSheet.tsx` | Formulario completo (título, descripción, prioridad local) |
| `__tests__/taskService.test.ts` | Pruebas del servicio con `fetch` simulado |

## Contrato del servicio

| Método | Petición | Resultado |
|---|---|---|
| `list(filters, signal)` | `GET /tasks?search=…&status=all\|pending\|completed` | 200 y `Task[]` |
| `get(id, signal)` | `GET /tasks/{id}` | 200 y `Task` (puede 404) |
| `create({title, description})` | `POST /tasks` | 201 y `Task` |
| `setCompleted(id, completed)` | `PATCH /tasks/{id}` con `{ "completed": true }` | 200 y `Task` |
| `remove(id)` | `DELETE /tasks/{id}` | 204 sin cuerpo |
| `replace(id, input, completed)` | `POST` + `PATCH` (si completada) + `DELETE` | edición por recreación |

> **Edición:** el backend no expone `PUT` (405) y `PATCH` rechaza título/descripción (`400 JSON inválido`). Para editar, `replace` crea la versión nueva con los datos modificados, preserva el estado `completed` y elimina la original. Si falla el alta, la original queda intacta; si falla el borrado, se informa el posible duplicado. Por esto el `id` y `createdAt` cambian al editar.

`request<T>` prepara encabezados, ejecuta `fetch`, lee la respuesta como texto, la convierte a JSON y lanza `ApiError(status, mensaje)`si el código HTTP indica error. No se envían credenciales ni cookies.

La interfaz usa `todas / pendientes / completadas`; el servicio las traduce a `all / pending / completed`.

## Comportamientos incorporados

- **Debounce de 275 ms** al escribir en el buscador o cambiar de estado: evita una petición por tecla.
- **AbortController + sequence**: cancela la consulta anterior e ignora respuestas rezagadas.
- **Conservar datos al recargar**: durante una actualización se mantienen las tarjetas existentes y se muestra «Actualizando…».
- **`busy` por tarjeta**: deshabilita cambio de estado y eliminación mientras opera esa tarea.
- **`saving` + `creating.current`**: bloquean un segundo alta antes del siguiente render y deshabilitan el formulario.
- **Sin reintento automático de POST**: si falla la red, el backend pudo guardar la tarea; se prefiere recargar el listado.
- **Prioridad**: no forma parte del contrato; se conserva como metadato local para el panel de administración.

## Verificación

```bash
npm run typecheck
npm test
```

Resultado: 5 suites, **27 tests** en verde.

Comprobaciones contra el despliegue:

```bash
curl.exe -i https://backend-proyecto.n7softwares.com/health
curl.exe -i "https://backend-proyecto.n7softwares.com/api/v1/tasks?status=all"
```

> Nota: `/health` respondió `401` (Basic Auth del laboratorio) al momento de la verificación; `/api/v1/tasks?status=all` respondió `200` con tareas reales y `Access-Control-Allow-Origin: *`.

## Recorrido sugerido de prueba

1. Abrir la app y observar el indicador de carga con tareas reales.
2. Crear «Prueba de integración» (título y, opcionalmente, descripción).
3. Escribir el nombre rápidamente: el resultado final debe corresponder al texto vigente.
4. Filtrar Pendientes, completar la tarea: debe desaparecer de ese filtro.
5. Filtrar Completadas y devolverla a pendiente.
6. Expandir: debe mostrar descripción y fecha sin cambiar el estado.
7. Eliminar solo la tarea de prueba.
8. Buscar texto sin coincidencias: mensaje de lista vacía.
9. Probar un título con solo espacios: se rechaza sin enviar el POST.
10. Tocar varias veces Agregar o el cambio de estado: no se generan operaciones duplicadas.
