# Arquitectura del frontend

## Decisiones

- **React + TypeScript estricto + Vite.** Build estático y servidor de desarrollo; no hay necesidad de un servidor de renderizado en esta primera fase.
- **React Router.** URLs reales, parámetros de búsqueda, historial, rutas desconocidas y carga diferida de pantallas. El layout permanece durante la carga de cada funcionalidad.
- **Carpetas por funcionalidad.** Los formularios y paneles de una funcionalidad viven junto a sus páginas. Solo los elementos compartidos están en `components`.
- **Context + reducer.** Adecuado para el tamaño actual. Las acciones son una unión discriminada; los componentes despachan cambios sin modificar el estado directamente. Los filtros y formularios permanecen como estado local.
- **Funciones puras para decisiones de negocio.** `domain/library.ts`, `domain/social.ts` y `domain/marketplace.ts` se prueban sin montar React. El simulador recibe identificador de lote y fecha: no obtiene tiempo, aleatoriedad o red por su cuenta.
- **Zod en la frontera de persistencia.** Se validan versión, importes, fechas, estados y estructura. Un guardado inválido no entra en la UI. Los formularios de agentes comparten validación con el reducer.
- **Repositorio de demostración.** `lib/demoRepository.ts` es el único acceso a almacenamiento local. Recibe un puerto inyectable para probar fallos de almacenamiento. Un backend real necesitará su propia API asíncrona; esta interfaz síncrona no pretende resolver sincronización remota.
- **CSS por capas.** Tokens de color y tipografía; base; layout; componentes reutilizables; detalles de las pantallas. No depende de estilos generados en JavaScript.

## Dependencias entre módulos

Las pantallas componen elementos de `components`, consultan datos de `data` y llaman a selectores/reglas de `domain`. `app` coordina navegación y estado. `lib` contiene fronteras con el navegador y formatos compartidos.

El catálogo actual es un fixture tipado. Algunas funciones de dominio lo consultan directamente para la demo. Al incorporar datos de una API, conviene pasar el catálogo, ofertas y bibliotecas como entradas a esas funciones y gestionar su carga asíncrona en la capa de funcionalidad. No hay llamadas remotas ocultas en los componentes actuales.

## Marketplace

Los importes se representan en céntimos. La simulación crea una copia del estado y procesa las reglas activas secuencialmente. Solo tras cumplir todas las condiciones registra un pedido, añade la propiedad, actualiza deseos y stock y pausa el agente. Una segunda regla para el mismo juego ve la propiedad ya actualizada.

La regla del distribuidor para Portal 2 es `max(precioMínimo, 975 - stock * 7)`. La región «Global» exige una clave global; el catálogo de ejemplo solo ofrece claves europeas, por lo que esa condición deja el agente esperando.

Estas comprobaciones sirven para demostrar comportamiento y realizar tests. En una integración comercial, el servidor debe volver a verificar propiedad, presupuesto, stock y permisos y ejecutar la operación de forma atómica e idempotente. El frontend no puede ser la autoridad sobre una compra.

## Pruebas

- Casos de dominio: condiciones que permiten o bloquean compras, duplicados, stock, importes y comparación de plataformas.
- Persistencia: recuperación de guardados corruptos y degradación cuando el navegador no permite guardar.
- Reducer: transiciones que cambian propiedad, recomendaciones y restablecimiento.
- Integración React: formularios, búsquedas, rutas, modo adaptativo, pedidos y mensajes renderizados como texto.

`test/environment.ts` conserva el `AbortController` nativo junto al `Request` de Node para evitar mezclar realms de Node y jsdom durante la navegación de React Router. Esta adaptación se limita al entorno de pruebas.

## Fuera del alcance actual

Autenticación, autorización multiusuario, sincronización real de cuentas, servicios de catálogo, chat/voz en tiempo real, IA, gestión real de claves y pagos. Tampoco hay pruebas visuales automatizadas en navegador.
