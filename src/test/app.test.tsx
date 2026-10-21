import { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppProvider } from '../app/AppProvider';
import { routes } from '../app/routes';
import { createDemoRepository, type StoragePort } from '../lib/demoRepository';
import { ADMIN_SETTINGS_KEY, createAccessRepository, SESSION_KEY } from '../lib/accessRepository';
import { defaultAdminSettings } from '../domain/access';

function renderApp(
  path: string,
  role: 'admin' | 'user' | null = 'user',
  storage = new Map<string, string>(),
) {
  storage.set(SESSION_KEY, JSON.stringify(role));
  const port: StoragePort = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => {
      storage.set(key, value);
    },
  };
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const user = userEvent.setup();
  const view = render(
    <AppProvider
      repository={(id) => createDemoRepository(port, id)}
      accessRepository={createAccessRepository(port, port)}
    >
      <Suspense fallback={<p>Cargando…</p>}>
        <RouterProvider router={router} />
      </Suspense>
    </AppProvider>,
  );
  return { user, router, storage, unmount: view.unmount };
}

async function enterDemo(user: ReturnType<typeof userEvent.setup>, role: 'admin' | 'user') {
  await user.click(
    await screen.findByRole('button', {
      name: `Usar cuenta ${role === 'admin' ? 'administrador' : 'normal'}`,
    }),
  );
  await user.click(screen.getByRole('button', { name: 'Entrar a SavePoint' }));
}

describe('React application flows', () => {
  it('filters the library and updates a game status through the real form controls', async () => {
    const { user } = renderApp('/library');
    await screen.findByRole('heading', { name: 'Todos tus mundos, en orden.' });
    await user.type(screen.getByRole('textbox', { name: 'Buscar en la colección' }), 'Hades');
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByTitle('Steam')).toBeVisible();
    expect(screen.getByTitle('Epic Games')).toBeVisible();
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Estado de Hades' }),
      'Completado',
    );
    await user.click(screen.getByRole('button', { name: /^Completado/ }));
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });
  it('adapts the dashboard to playing context and returns to discovery mode', async () => {
    const { user } = renderApp('/');
    await screen.findByRole('heading', { name: 'Tu próxima partida empieza aquí.' });
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Contexto de actividad' }),
      'playing',
    );
    expect(screen.getByText('EXPERIENCIA ADAPTATIVA · EN PARTIDA')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Unirse al canal' }));
    expect(screen.getByRole('button', { name: 'Salir del canal' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Terminar sesión' }));
    expect(screen.getByText('TU SIGUIENTE GRAN AVENTURA')).toBeVisible();
  });
  it('simulates a purchase and exposes it under real routed order and library views', async () => {
    const { user } = renderApp('/marketplace?tab=agents');
    await screen.findByRole('button', { name: 'Simular mercado' });
    await user.click(screen.getByRole('button', { name: 'Simular mercado' }));
    expect(screen.getByText('Pedido simulado por 1,95 €. Añadido a tu biblioteca.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Simular mercado' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Mis pedidos' }));
    expect(await screen.findByRole('cell', { name: 'Portal 2' })).toBeVisible();
    await user.click(screen.getByRole('link', { name: 'Mi biblioteca' }));
    await screen.findByRole('heading', { name: 'Todos tus mundos, en orden.' });
    expect(screen.getByRole('combobox', { name: 'Estado de Portal 2' })).toHaveValue('Pendiente');
  });
  it('shows useful validation for an impossible purchase budget', async () => {
    const { user } = renderApp('/marketplace');
    await user.click(await screen.findByRole('button', { name: 'Crear agente de compra' }));
    const dialog = screen.getByRole('dialog');
    await user.selectOptions(within(dialog).getByRole('combobox', { name: 'Juego' }), 'sea');
    const maximum = within(dialog).getByRole('spinbutton', { name: 'Precio máximo (€)' });
    const budget = within(dialog).getByRole('spinbutton', {
      name: 'Presupuesto de esta regla (€)',
    });
    await user.clear(maximum);
    await user.type(maximum, '20');
    await user.clear(budget);
    await user.type(budget, '5');
    await user.click(
      within(dialog).getByRole('button', { name: 'Activar agente de demostración' }),
    );
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'El presupuesto debe ser igual o superior',
    );
  });
  it('stores and displays message text without interpreting it as HTML', async () => {
    const { user } = renderApp('/friends');
    const heading = await screen.findByRole('heading', { name: 'Jaime' });
    const card = heading.closest('article');
    if (!card) throw new Error('Missing friend card');
    await user.click(within(card).getByRole('button', { name: 'Chat' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Mensaje para Jaime' }),
      '<img src=x onerror=alert(1)>',
    );
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeVisible();
    expect(document.querySelector('img[src="x"]')).toBeNull();
  });
  it('handles unknown routes with a way home', async () => {
    renderApp('/missing');
    expect(await screen.findByRole('heading', { name: 'Te has salido del mapa.' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Volver a mi espacio' })).toHaveAttribute('href', '/');
  });
});

describe('demo login and administration', () => {
  it('requires login and returns to the requested page including its query', async () => {
    const { user, router } = renderApp('/library?q=Hades', null);
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Mi biblioteca' })).not.toBeInTheDocument();
    await enterDemo(user, 'user');
    await screen.findByRole('heading', { name: 'Todos tus mundos, en orden.' });
    expect(router.state.location.pathname).toBe('/library');
    expect(router.state.location.search).toBe('?q=Hades');
  });

  it('rejects incorrect credentials and signs in with the admin demo account', async () => {
    const { user, storage } = renderApp('/login', null);
    await user.type(await screen.findByLabelText('Usuario o correo electrónico'), 'admin');
    await user.type(screen.getByLabelText('Contraseña'), 'incorrect');
    await user.click(screen.getByRole('button', { name: 'Entrar a SavePoint' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos');
    await enterDemo(user, 'admin');
    expect(await screen.findByRole('heading', { name: 'Panel de administración' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Administración' })).toBeVisible();
    expect(JSON.parse(storage.get(SESSION_KEY) ?? 'null')).toBe('admin');
    expect(storage.get(SESSION_KEY)).not.toContain('Admin123!');
  });

  it('blocks the admin route and distributor controls for a normal account', async () => {
    const { user, router } = renderApp('/admin');
    expect(
      await screen.findByRole('heading', { name: 'Acceso reservado al administrador.' }),
    ).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Administración' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Guardar ajustes' })).not.toBeInTheDocument();
    await act(() => router.navigate('/marketplace?tab=seller'));
    await screen.findByRole('heading', { name: 'Que la próxima oferta te encuentre.' });
    expect(
      screen.queryByRole('button', { name: 'Panel del distribuidor' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Guardar regla de ejemplo' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
    await act(() => router.navigate('/admin'));
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  });

  it('persists admin settings and applies them after switching to the normal account and reloading', async () => {
    const { user, storage, unmount } = renderApp('/admin', 'admin');
    await user.type(
      await screen.findByLabelText('Aviso de la plataforma'),
      'Bienvenidos a la presentación',
    );
    await user.click(screen.getByRole('checkbox', { name: /Marketplace habilitado/ }));
    await user.click(screen.getByRole('button', { name: 'Guardar ajustes' }));
    expect(screen.getByText('Bienvenidos a la presentación', { selector: 'p' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await enterDemo(user, 'user');
    await screen.findByRole('heading', { name: 'Tu próxima partida empieza aquí.' });
    expect(screen.getByText('Bienvenidos a la presentación', { selector: 'p' })).toBeVisible();
    await user.click(screen.getByRole('link', { name: 'Marketplace' }));
    expect(
      await screen.findByRole('heading', { name: 'El marketplace está en pausa.' }),
    ).toBeVisible();
    unmount();
    renderApp('/marketplace', 'user', storage);
    expect(
      await screen.findByRole('heading', { name: 'El marketplace está en pausa.' }),
    ).toBeVisible();
    expect(screen.getByText('Bienvenidos a la presentación', { selector: 'p' })).toBeVisible();
  });

  it('pauses simulations while allowing offers and existing agents to be viewed', async () => {
    const storage = new Map([
      [ADMIN_SETTINGS_KEY, JSON.stringify({ ...defaultAdminSettings, simulationsEnabled: false })],
    ]);
    const { user } = renderApp('/marketplace?tab=agents', 'user', storage);
    expect(await screen.findByRole('button', { name: 'Simular mercado' })).toBeDisabled();
    expect(screen.getByText(/El administrador ha pausado/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Mis pedidos' }));
    expect(screen.queryByRole('cell', { name: 'Portal 2' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ofertas' }));
    expect(screen.getByRole('heading', { name: 'Portal 2' })).toBeVisible();
  });

  it('keeps orders isolated and restores the admin scenario after switching accounts', async () => {
    const { user } = renderApp('/marketplace?tab=agents', 'admin');
    await user.click(await screen.findByRole('button', { name: 'Simular mercado' }));
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await enterDemo(user, 'user');
    await user.click(await screen.findByRole('link', { name: 'Marketplace' }));
    await user.click(await screen.findByRole('button', { name: 'Mis pedidos' }));
    expect(screen.queryByRole('cell', { name: 'Portal 2' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await enterDemo(user, 'admin');
    await user.click(await screen.findByRole('link', { name: 'Marketplace' }));
    await user.click(await screen.findByRole('button', { name: 'Mis pedidos' }));
    expect(await screen.findByRole('cell', { name: 'Portal 2' })).toBeVisible();
  });
});
