# Arquitectura del frontend

## Decisiones

- **React + TypeScript estricto + Vite.** Build estático y servidor de desarrollo; no hay necesidad de un servidor de renderizado en esta primera fase.
- **React Router.** URLs reales, parámetros de búsqueda, historial, rutas desconocidas y carga diferida de pantallas. El layout permanece durante la carga de cada funcionalidad.
- **Carpetas por funcionalidad.** Los formularios y paneles de una funcionalidad viven junto a sus páginas. Solo los elementos compartidos están en `components`.
- **Context + reducer.** Adecuado para el tamaño actual. Las acciones son una unión discriminada; los componentes despachan cambios sin modificar el estado directamente. Los filtros y formularios permanecen como estado local.
- **Funciones puras para decisiones de negocio.** `domain/library.ts`, `domain/social.ts` y `domain/marketplace.ts` se prueban sin montar React. El simulador recibe identificador de lote y fecha: no obtiene tiempo, aleatoriedad o red por su cuenta.
- **Zod en la frontera de persistencia.** Se validan versión, importes, fechas, estados y estructura. Un guardado inválido no entra en la UI. Los formularios de agentes comparten validación con el reducer.
- **Repositorios de demostración.** `lib/demoRepository.ts` aísla los datos de cada cuenta; `lib/accessRepository.ts` conserva la sesión y los ajustes generales. Reciben puertos inyectables para probar fallos de almacenamiento. Un backend real necesitará su propia API asíncrona; estas interfaces síncronas no pretenden resolver sincronización remota.
- **CSS por capas.** Tokens de color y tipografía; base; layout; componentes reutilizables; detalles de las pantallas. No depende de estilos generados en JavaScript.

## Dependencias entre módulos

Las pantallas componen elementos de `components`, consultan datos de `data` y llaman a selectores/reglas de `domain`. `app` coordina navegación y estado. `lib` contiene fronteras con el navegador y formatos compartidos.

El catálogo actual es un fixture tipado. Algunas funciones de dominio lo consultan directamente para la demo. Al incorporar datos de una API, conviene pasar el catálogo, ofertas y bibliotecas como entradas a esas funciones y gestionar su carga asíncrona en la capa de funcionalidad. No hay llamadas remotas ocultas en los componentes actuales.

## Marketplace

Los importes se representan en céntimos. La simulación crea una copia del estado y procesa las reglas activas secuencialmente. Solo tras cumplir todas las condiciones registra un pedido, añade la propiedad, actualiza deseos y stock y pausa el agente. Una segunda regla para el mismo juego ve la propiedad ya actualizada.

La regla del distribuidor para Portal 2 es `max(precioMínimo, 975 - stock * 7)`. La región «Global» exige una clave global; el catálogo de ejemplo solo ofrece claves europeas, por lo que esa condición deja el agente esperando.

Estas comprobaciones sirven para demostrar comportamiento y realizar tests. En una integración comercial, el servidor debe volver a verificar propiedad, presupuesto, stock y permisos y ejecutar la operación de forma atómica e idempotente. El frontend no puede ser la autoridad sobre una compra.

## Acceso y administración de demostración

`AccessProvider` mantiene la cuenta actual y los ajustes generales validados con Zod. Las dos cuentas públicas están definidas en `domain/access.ts`. La sesión guarda solo un identificador conocido en `sessionStorage`; el rol se obtiene del fixture. Al cerrar sesión, se elimina el identificador guardado. Si falla el almacenamiento, se informa y se mantiene el flujo en memoria.

`RequireSession` protege el layout y conserva la ruta solicitada para después del login. `RequireAdmin` bloquea `/admin` al jugador; el enlace y el panel del distribuidor también se restringen por rol. `updateSettings` vuelve a comprobar el rol y el esquema antes de aplicar cambios. El dispatch del estado rechaza acciones sin sesión, cambios de distribuidor del jugador y ejecuciones de mercado cuando están deshabilitadas. Son restricciones de la demo, no una frontera de seguridad: el frontend y sus fixtures se pueden modificar.

`AccountScope` remonta el proveedor de estado al cambiar de cuenta y carga su clave de almacenamiento. Se preserva `savepoint:demo:v2` para el jugador existente, mientras el admin usa una clave separada. Los ajustes compartidos viven fuera de esos estados, por lo que sobreviven a cerrar sesión y a restablecer una cuenta. El stock del distribuidor y las compras son escenarios independientes por cuenta. Los ajustes se recuperan al cambiar de cuenta dentro de la app o al recargar otra pestaña; no existe sincronización multiusuario remota.

## Pruebas

- Casos de dominio: condiciones que permiten o bloquean compras, duplicados, stock, importes y comparación de plataformas.
- Persistencia: recuperación de guardados corruptos y degradación cuando el navegador no permite guardar.
- Reducer: transiciones que cambian propiedad, recomendaciones y restablecimiento.
- Integración React: formularios, búsquedas, rutas, modo adaptativo, pedidos, mensajes renderizados como texto, login, roles, aislamiento de cuentas y ajustes compartidos.

`test/environment.ts` conserva el `AbortController` nativo junto al `Request` de Node para evitar mezclar realms de Node y jsdom durante la navegación de React Router. Esta adaptación se limita al entorno de pruebas.

## Fuera del alcance actual

Autenticación y autorización de servidor, sincronización real de cuentas, servicios de catálogo, chat/voz en tiempo real, IA, gestión real de claves y pagos. El login con roles solo representa el flujo de la demo. Tampoco hay pruebas visuales automatizadas en navegador incluidas en CI.
