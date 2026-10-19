# SavePoint

Frontend de una plataforma social de videojuegos: biblioteca unificada, descubrimiento, compañeros de juego y marketplace con agentes. Implementado con **React 19, TypeScript y Vite** para poder continuar el proyecto después de la presentación.

La aplicación actual funciona con datos de demostración. No incluye backend, autenticación ni transacciones reales.

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

- Biblioteca: búsqueda, género, plataforma, estado y ordenación. Un título con varias plataformas se muestra una sola vez.
- Deseos y fichas de juegos, con recomendaciones personales y explicación del grafo de afinidad.
- Amigos: búsqueda, sugerencias, comparación de bibliotecas y comprobación de compatibilidad para cooperativo.
- Invitaciones, recomendaciones y mensajes guardados localmente.
- Modo «En partida», que cambia el contenido prioritario del inicio.
- Marketplace: ofertas, reglas de compra, validación de presupuesto, simulación de pedidos y reglas de precio del distribuidor.
- Plataformas conectadas, preferencias, recorrido guiado y restablecimiento de la demo.

Para presentar: **Configuración → Restablecer demo → Iniciar recorrido guiado**. El agente inicial de Portal 2 permite completar la compra de ejemplo por 1,95 € con «Simular mercado». [Guion de presentación](docs/demo.md).

## Organización del código

```text
src/
  app/           Proveedores, navegación, layout y reducer tipado
  components/    Componentes compartidos: botones, diálogos, tarjetas, portadas
  data/          Catálogo, perfiles, colección y ofertas de demostración
  domain/        Tipos, esquemas y reglas de biblioteca, afinidad social y mercado
  features/      Pantallas y componentes agrupados por funcionalidad
    dashboard/
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

- El estado se guarda en este navegador, bajo `savepoint:demo:v2`. Si está corrupto, es incompatible o el almacenamiento está bloqueado, se carga un estado inicial y se muestra un aviso.
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
