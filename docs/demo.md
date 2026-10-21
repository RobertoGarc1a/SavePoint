# Presentación · 5–6 minutos

Arranca el proyecto con `npm ci` y `npm run dev`. La demo muestra primero el login; si ya hay una sesión abierta, pulsa **Cerrar sesión**. Las tarjetas rellenan las credenciales, y después hay que pulsar **Entrar a SavePoint**.

| Perfil         | Usuario   | Contraseña    |
| -------------- | --------- | ------------- |
| Administrador  | `admin`   | `Admin123!`   |
| Usuario normal | `usuario` | `Usuario123!` |

Antes de presentar, entra como admin, abre **Administración**, pulsa **Restaurar valores iniciales** y guarda si hay cambios. Así el marketplace y las simulaciones están habilitados. Después entra como usuario normal y visita **Configuración → Restablecer demo**. Puedes mostrar las instrucciones en pantalla con **Iniciar recorrido**.

0. **Login y administración — 60 segundos.** Entra como admin y muestra el panel de administración. Escribe un aviso, pausa las simulaciones y guarda. Cierra sesión y entra como usuario normal: el aviso aparece y «Simular mercado» está deshabilitado. No aparece Administración; entrar directamente en `/admin` muestra acceso restringido. Vuelve al admin, reactiva las simulaciones y guarda. Cierra sesión y vuelve al usuario normal para continuar.

1. **Mi espacio — 40 segundos.** Explica la fragmentación: decidir qué jugar, con quién y a qué precio. Señala el resumen de colección, amigos y oferta.
2. **Mi biblioteca — 50 segundos.** Busca Hades: una entrada con Steam y Epic. Cambia su estado. Prueba filtros de plataforma, género y ordenación.
3. **Amigos — 60 segundos.** Abre «¿A qué jugamos?». Con Jaime seleccionado aparecen títulos compartidos en plataformas compatibles. Invita al grupo y consulta la invitación en el chat local. En «Descubrir», explica la afinidad con «¿Por qué?».
4. **Mi espacio — 40 segundos.** Cambia el contexto a «En partida»: se muestran el escuadrón y las herramientas de sesión. La voz es simulada.
5. **Marketplace — 60 segundos.** En «Mis agentes», pulsa «Simular mercado». Portal 2 cumple el máximo de 5 €, presupuesto de 10 € y mínimo de un amigo. La regla registra un pedido de 1,95 €, añade el juego a la colección y se pausa. Consulta «Mis pedidos». Si quieres explicar el ajuste de precio por inventario, vuelve a la cuenta admin y abre «Panel del distribuidor»; este escenario y su stock pertenecen a la cuenta admin.

Si ya compraste Portal 2 en otra prueba, restablece la demo de esa cuenta antes de repetir. Crear otro agente para un título poseído se rechaza deliberadamente. Los pedidos de una cuenta no aparecen en la otra. Restablecer la demo del jugador conserva el aviso y los ajustes generales del administrador.

Las cuatro tecnologías del documento se representan así:

| Tecnología           | Parte de la demo                                     |
| -------------------- | ---------------------------------------------------- |
| Context Graphs       | Explicación de afinidad y comparación de bibliotecas |
| Adaptive Experiences | Cambio de contexto a En partida                      |
| Machine Sellers      | Regla de precio del distribuidor                     |
| Machine Customers    | Agentes con condiciones y pedidos simulados          |

Toda la actividad es de demostración; el login y los roles se simulan en el frontend. No hay pagos, cuentas reales ni ejecución de IA.
