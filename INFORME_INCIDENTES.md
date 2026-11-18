# Informe de incidencias · Gestor de tareas

**Estudiante:** _(completar)_  
**Fecha:** 18/11/2026  
**Proyecto / rama Git:** gestor-tareas-debugging / `main` (commit base `0cf095c first commit`)  
**Entorno (Expo SDK, Android, dispositivo):** Expo SDK 57.0.x, React Native 0.86.0, React 19.2.3, TypeScript 5.9, Node v24.19.0, Windows 11. Verificación en Expo Web (`npx expo start --web`, puerto 19006) e inspección con DevTools del browser. El Expo Go disponible era SDK 58, incompatible con el proyecto (SDK 57), por lo que se usó la build web y se documentó la alternativa de development build.

## Resumen ejecutivo

Se exploró la app sin modificarla, se ejecutó `npm test` como línea base y se reprodujeron los comportamientos inesperados de la guía. Se detectaron **6 defectos** (4 exigidos como mínimo): búsqueda sensible a mayúsculas/espacios, validación que aceptaba títulos vacíos, lista que no reaccionaba al buscador, toggle que no actualizaba la UI, spinner que no se detenía al fallar la API y detalle expandido que se "pegaba" a otra tarea al filtrar. Todos fueron corregidos con cambios mínimos, se añadieron pruebas de regresión y se mejoró la interfaz con `ui-ux-pro-max`, respetando las funciones originales.

## Incidencia 1
- **Título de incidencia:** Búsqueda sensible a mayúsculas y a espacios
- **Pasos para reproducir:** Escribir `VALIDAR` o `  login  ` en "Buscar por nombre..."
- **Esperado / observado:** Esperado: encontrar "Validar login" en ambos casos. Observado: 0 resultados.
- **Herramienta usada (DevTools / consola / test):** `__tests__/taskFilters.test.ts` (fallaba antes), inspector del DOM
- **Hipótesis y evidencia:** `String.includes` es case-sensitive y no ignora espacios. El test esperaba longitud 1 con `'VALIDAR'` y `'  login  '`.
- **Archivo y función involucrada:** `src/utils/taskFilters.ts` → `filterTasks`
- **Causa raíz:** Se pasaba `query` directamente a `includes` sin normalizar.
- **Corrección aplicada:** `const normalizedQuery = query.trim().toLowerCase()` y comparar contra `task.title.toLowerCase()`.
- **Prueba de regresión:** `taskFilters.test.ts` → "busca sin distinguir entre minúsculas y mayúsculas" e "ignora espacios antes y después de la búsqueda".
- **Estado:** Corregido

## Incidencia 2
- **Título de incidencia:** Se aceptaban títulos compuestos solo por espacios
- **Pasos para reproducir:** Escribir `"   "` en "Nueva tarea" y presionar Agregar
- **Esperado / observado:** Esperado: mensaje de validación. Observado: se creaba una tarea sin nombre visible.
- **Herramienta usada (DevTools / consola / test):** `__tests__/taskValidation.test.ts` (fallaba antes)
- **Hipótesis y evidencia:** `title.length > 0` devuelve `true` para tres espacios; el test esperaba `false`.
- **Archivo y función involucrada:** `src/utils/taskValidation.ts` → `isValidTaskTitle`
- **Causa raíz:** Validación sin recortar el texto antes de medir su longitud.
- **Corrección aplicada:** `return title.trim().length > 0;`
- **Prueba de regresión:** `taskValidation.test.ts` → "rechaza un título compuesto solo de espacios" y "acepta un título que contiene palabras".
- **Estado:** Corregido

## Incidencia 3
- **Título de incidencia:** La lista no se actualizaba al escribir en el buscador
- **Pasos para reproducir:** Escribir cualquier texto en el buscador y observar la lista
- **Esperado / observado:** Esperado: lista filtrada en vivo. Observado: la lista no cambiaba.
- **Herramienta usada (DevTools / consola / test):** React DevTools / inspección del DOM en Expo Web
- **Hipótesis y evidencia:** El `useMemo` calculaba `visibleTasks` con `query` pero no lo declaraba en dependencias, por lo que devolvía el valor memorizado.
- **Archivo y función involucrada:** `app/index.tsx` → `TaskManagerScreen`, `visibleTasks`
- **Causa raíz:** Array de dependencias incompleto (`[tasks, status]`).
- **Corrección aplicada:** `[tasks, query, status]`.
- **Prueba de regresión:** Verificación manual en browser: al escribir, la lista se filtra; más las pruebas de `taskFilters`.
- **Estado:** Corregido

## Incidencia 4
- **Título de incidencia:** Marcar una tarea como completada no actualizaba la interfaz
- **Pasos para reproducir:** Tocar el cuadrado de "Validar login"
- **Esperado / observado:** Esperado: tachado, badge de completada y contadores actualizados. Observado: sin cambio en la UI/contadores.
- **Herramienta usada (DevTools / consola / test):** React DevTools + `__tests__/TaskCard.test.tsx`
- **Hipótesis y evidencia:** Se mutaba el objeto encontrado (`found.completed = !found.completed`) y se llamaba `setTasks(tasks)` con la misma referencia de array; React no detectaba el cambio.
- **Archivo y función involucrada:** `app/index.tsx` → `toggleTask`
- **Causa raíz:** Mutación directa del estado + `setState` con la misma referencia (rompe inmutabilidad).
- **Corrección aplicada:** `setTasks(previous => previous.map(task => task.id === id ? { ...task, completed: !task.completed } : task))`.
- **Prueba de regresión:** `TaskCard.test.tsx` → "permite completar una tarea", más verificación en browser del badge `✓ COMPLETADA` y contadores (5/2/3).
- **Estado:** Corregido

## Incidencia 5
- **Título de incidencia:** El indicador de carga quedaba girando indefinidamente al fallar la API
- **Pasos para reproducir:** Presionar "⚠ Simular error API"
- **Esperado / observado:** Esperado: mensaje de error y spinner detenido. Observado: error visible pero "Consultando tareas…" permanecía.
- **Herramienta usada (DevTools / consola / test):** Consola (`console.error('[taskService] No se cargaron las tareas', caught)`) + inspector del DOM
- **Hipótesis y evidencia:** `setLoading(false)` solo estaba en el bloque `try`; la excepción (`HTTP 503` simulado) saltaba al `catch`, dejando `loading = true`.
- **Archivo y función involucrada:** `app/index.tsx` → `loadTasks`
- **Causa raíz:** Falta de restauración del estado de carga en la ruta de error.
- **Corrección aplicada:** `setLoading(false)` dentro del `catch`.
- **Prueba de regresión:** Verificación en browser: tras el error, `No pudimos cargar las tareas. Probá otra vez.` visible y `Consultando tareas` ausente (rol `alert` presente).
- **Estado:** Corregido

## Incidencia 6
- **Título de incidencia:** El detalle expandido se asociaba a la tarjeta equivocada al filtrar
- **Pasos para reproducir:** Expandir una tarjeta, cambiar de filtro y volver; verificar qué tarjeta queda abierta
- **Esperado / observado:** Esperado: el detalle corresponde a su tarea y se colapsa al cambiar de filtro. Observado: con claves por índice, el estado local se reutilizaba en otra tarjeta.
- **Herramienta usada (DevTools / consola / test):** React DevTools + `__tests__/TaskCard.test.tsx`
- **Hipótesis y evidencia:** `keyExtractor={(_item, index) => String(index)}` hacía que React reutilizara componentes con otra tarea, conservando su `expanded` local.
- **Archivo y función involucrada:** `app/index.tsx` (FlatList) y `src/components/TaskCard.tsx`
- **Causa raíz:** Clave inestable + estado de UI local sin control del padre.
- **Corrección aplicada:** `keyExtractor={(item) => item.id}` y estado `expandedId` en la pantalla, que se limpia al cambiar `status`, `priorityFilter`, `query` u `order`. `TaskCard` acepta `expanded`/`onExpandChange` opcionales (patrón controlado/no controlado).
- **Prueba de regresión:** `TaskCard.test.tsx` → "respeta el estado expandido controlado por el padre" (con `expanded={false}` no muestra el detalle; con `expanded={true}` lo muestra).
- **Estado:** Corregido

## Otras incidencias (opcional)

- **Compatibilidad de entorno:** el Expo Go instalado era SDK 58 y el proyecto SDK 57. No es un defecto del código; se documentó usar development build o Expo Go de SDK 57, y se validó la app vía Expo Web.
- **Dependencias de pruebas:** `jest-expo@57` requiere `@react-native/jest-preset@^0.86.3` como peer; se fijó en `devDependencies` para que `npm install` no lo elimine (la instalación se realiza con `--legacy-peer-deps` por un conflicto entre `react@19.2.3` y `react-dom@19.3.1` de paquetes transitivos).

## Pruebas

| Prueba | Antes | Después | Evidencia |
|---|---|---|---|
| Búsqueda | 2 tests fallaban (`VALIDAR`, `'  login  '`) | 4/4 tests de `taskFilters` pasan | `__tests__/taskFilters.test.ts` + browser |
| Validación | 1 test fallaba (`'   '` se aceptaba) | 3/3 tests de `taskValidation` pasan | `__tests__/taskValidation.test.ts` |
| Actualización de estado | UI y contadores no cambiaban | Badge `✓ COMPLETADA`, contadores 5/2/3 | `__tests__/TaskCard.test.tsx` + browser |
| Error de servicio | Spinner quedaba visible | Spinner ausente, `role="alert"` presente | Consola + inspector del DOM |
| Expandido al filtrar | Detalle se pegaba a otra tarjeta | Se colapsa al cambiar filtros | `__tests__/TaskCard.test.tsx` |
| Administración (nuevo) | No existía | 7/7 tests de `taskAdmin` pasan | `__tests__/taskAdmin.test.ts` |

**Resultado final:** 4 suites, **17 tests**, todos en verde. `npx tsc --noEmit` sin errores.

## Conclusión y control de cambios

- **Commit final (hash):** `PENDIENTE_HASH`
- **Mensaje del commit:** `fix: corregir 6 incidencias de debugging y ampliar gestor de tareas`
- **Qué aprendí y cómo lo aplicaría a mi app final:** A separar síntoma de causa raíz (la UI no Actualizaba → inmutabilidad rota; el spinner no paraba → estado no restaurado en el `catch`). A usar los tests como especificación del comportamiento esperado y a escribir una prueba de regresión por cada corrección. A mantener claves estables en listas y a controlar el estado de UI desde el padre cuando depende de filtros. Finalmente, a verificar siempre en el entorno real (browser/dispositivo) además de la suite automatizada, y a documentar cada hallazgo con pasos reproducibles para poder defenderlo.
