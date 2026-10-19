# Evolución como proyecto personal

## 1. Catálogo real

- Sustituir fixtures por un servicio de catálogo detrás de un cliente API tipado.
- Incorporar estados de carga, error, paginación y caché de consultas.
- Mantener las claves privadas del proveedor en un backend, no en variables públicas de Vite.
- Pasar catálogo y ofertas como entradas de las funciones de dominio.

## 2. Cuentas y colección persistente

- Añadir autenticación y sesiones verificadas por servidor.
- Modelar propiedad de biblioteca, progreso y preferencias por usuario.
- Reemplazar la persistencia local por endpoints asíncronos con validación de respuestas.
- Implementar OAuth y sincronización únicamente para plataformas con una integración permitida y disponible.

## 3. Comunidad

- Persistir amistades, solicitudes y recomendaciones en servidor.
- Incorporar notificaciones y mensajes en tiempo real.
- Calcular compatibilidad con datos reales por edición, plataforma y modalidad.
- Sustituir los porcentajes ilustrativos por un modelo explicable y medible.

## 4. Marketplace

- Mantener inicialmente alertas de precio y enlaces a distribuidores.
- Validar acuerdos y acceso a inventario antes de implementar compras delegadas.
- Hacer transacciones, presupuestos e idempotencia en servidor; usar primero un entorno sandbox del proveedor.
- Añadir pruebas de contrato e integración cuando existan servicios reales.
