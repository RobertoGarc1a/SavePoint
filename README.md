# SavePoint

Frontend de una plataforma social de videojuegos: biblioteca unificada, descubrimiento, compañeros de juego y marketplace con agentes. Implementado con **React 19, TypeScript y Vite** para poder continuar el proyecto después de la presentación.

La aplicación actual funciona con datos de demostración. Incluye login simulado con roles de administrador y jugador; no incluye backend, autenticación de servidor ni transacciones reales.

## Desarrollo

Requiere **Node.js 22.12 o superior** y npm.

```sh
npm ci
npm run dev
```

Vite muestra la URL local, normalmente `http://localhost:5173`. Para verificar la versión de producción:

```sh
npm run build
npm run preview
```

No se necesitan variables de entorno, cuentas de terceros ni claves de API.

## Qué puedes probar

- Login con validación de credenciales, cierre de sesión y rutas restringidas por rol.
- Administración: aviso de la plataforma, activación del marketplace y pausa de las simulaciones. Los ajustes se conservan al cambiar de cuenta.
- Biblioteca: búsqueda, género, plataforma, estado y ordenación. Un título con varias plataformas se muestra una sola vez.
- Deseos y fichas de juegos, con recomendaciones personales y explicación del grafo de afinidad.
- Amigos: búsqueda, sugerencias, comparación de bibliotecas y comprobación de compatibilidad para cooperativo.
- Invitaciones, recomendaciones y mensajes guardados localmente.
- Modo «En partida», que cambia el contenido prioritario del inicio.
- Marketplace: ofertas, reglas de compra, validación de presupuesto, simulación de pedidos y reglas de precio del distribuidor.
- Plataformas conectadas, preferencias, recorrido guiado y restablecimiento de la demo.

Para presentar: entra como **admin**, revisa **Administración**, guarda los ajustes y cierra sesión. Entra como **usuario** y usa **Configuración → Restablecer demo → Iniciar recorrido guiado**. El agente inicial de Portal 2 permite completar la compra de ejemplo por 1,95 € con «Simular mercado». [Guion de presentación](docs/demo.md).

### Cuentas de demostración

| Rol            | Usuario o correo                     | Contraseña    |
| -------------- | ------------------------------------ | ------------- |
| Administrador  | `admin` o `admin@savepoint.demo`     | `Admin123!`   |
| Usuario normal | `usuario` o `usuario@savepoint.demo` | `Usuario123!` |

Las tarjetas del login rellenan las credenciales; pulsa **Entrar a SavePoint** para acceder. El administrador entra en `/admin` y el jugador en su espacio, salvo que hubiera solicitado otra ruta antes de iniciar sesión. Solo el admin ve Administración y el panel del distribuidor. El acceso directo a `/admin` con una cuenta normal muestra un mensaje de acceso restringido.

Estos usuarios y contraseñas son fixtures públicos del frontend. Los permisos ilustran el flujo de la demo y no ofrecen seguridad frente a la modificación del código o del almacenamiento del navegador. Una versión real necesita autenticación y autorización en el servidor.

## Organización del código

```text
src/
  app/           Proveedores, navegación, layout y reducer tipado
  components/    Componentes compartidos: botones, diálogos, tarjetas, portadas
  data/          Catálogo, perfiles, colección y ofertas de demostración
  domain/        Tipos, esquemas y reglas de biblioteca, afinidad social y mercado
  features/      Pantallas y componentes agrupados por funcionalidad
    dashboard/
    auth/
    admin/
    library/
    discovery/
    social/
    marketplace/
    settings/
  lib/           Persistencia y formato de fechas/importes
  styles/        Tokens, estilos base, layout y componentes/páginas
  test/          Pruebas de integración y entorno de tests
public/assets/   Ilustraciones alternativas y tipografías locales
```

Las pantallas se cargan por ruta con `React.lazy`. Los componentes usan estado declarativo: no hay generación de HTML mediante cadenas, `innerHTML`, un router artesanal ni listeners globales de clicks.

La lógica de compra es una función pura y el acceso a `localStorage` está aislado tras `DemoRepository`. Los datos guardados se validan con Zod antes de cargarse. Las decisiones de estructura y los puntos de extensión están en [arquitectura](docs/architecture.md).

## Comprobaciones

```sh
npm run check         # ESLint, tests, TypeScript, build y formato
npm test              # Vitest: dominio, persistencia y flujos React
npm run test:watch    # Tests en modo desarrollo
npm run typecheck     # TypeScript estricto
npm run lint          # ESLint y reglas de hooks
npm run format        # Prettier
```

GitHub Actions ejecuta `npm ci` y `npm run check` con cada push y pull request. El archivo `package-lock.json` está versionado para reproducir la instalación.

Las pruebas de interfaz utilizan React Testing Library con un DOM simulado. No sustituyen una revisión visual y de accesibilidad en un navegador real.

## Persistencia y límites de la demo

- El estado del jugador se guarda en este navegador bajo `savepoint:demo:v2`; el del admin, bajo `savepoint:demo:v2:admin`. Cada cuenta conserva su colección, preferencias, agentes, mensajes, pedidos y stock de prueba. Se conservan los datos existentes del jugador. Si están corruptos, son incompatibles o el almacenamiento está bloqueado, se carga un estado inicial y se muestra un aviso.
- Los ajustes generales se guardan bajo `savepoint:admin:v1` y se aplican a ambas cuentas al cambiar de sesión o recargar. El restablecimiento de una cuenta no elimina los ajustes generales ni los datos de la otra.
- La sesión de demo se conserva en `sessionStorage`, bajo `savepoint:session:v1`, hasta cerrar sesión o terminar la sesión del navegador. Solo se guarda el identificador del perfil, sin contraseñas. Si el almacenamiento está bloqueado, se permite trabajar en memoria y se avisa.
- La versión antigua del prototipo usaba otra clave; no se importa automáticamente a esta estructura.
- El marketplace trabaja en **céntimos enteros**. Cada regla tiene su presupuesto y permite una unidad. Comprueba precio, región, stock, amigos y propiedad previa. Se pausa tras comprar.
- «Simular mercado» es una acción explícita: no hay agentes ejecutándose en segundo plano.
- El chat, las invitaciones, los perfiles y las conexiones de plataformas son simulados. La privacidad es una preferencia local; no hay perfiles publicados.
- El grafo y los porcentajes de afinidad son ilustrativos. La matriz de cooperativo es un ejemplo, no una verificación real de compatibilidad por edición o consola.
- Las portadas se solicitan a la CDN pública de Steam. Si fallan, se usan los SVG locales. No se consultan cuentas o APIs de Steam.
- Las tipografías incluyen sus licencias en `public/assets/fonts/`. Los títulos y portadas de los videojuegos pertenecen a sus titulares.

## Continuar como proyecto personal

El alcance funcional parte de `PrimeraEntregaSavePoint.docx`. El [plan de evolución](docs/roadmap.md) propone incorporar catálogo real, autenticación y persistencia remota por etapas sin presentar la simulación de compras como una integración comercial.

El build es una SPA estática en `dist/`. El alojamiento debe servir `index.html` para las rutas del cliente (`/library`, `/games/portal`, etc.). Este repositorio no activa ningún despliegue automáticamente.
