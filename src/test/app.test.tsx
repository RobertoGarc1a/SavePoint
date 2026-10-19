import { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppProvider } from '../app/AppProvider';
import { routes } from '../app/routes';
import { createDemoRepository, type StoragePort } from '../lib/demoRepository';

function renderApp(path: string) {
  const storage = new Map<string, string>();
  const port: StoragePort = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => {
      storage.set(key, value);
    },
  };
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const user = userEvent.setup();
  render(
    <AppProvider repository={createDemoRepository(port)}>
      <Suspense fallback={<p>Cargando…</p>}>
        <RouterProvider router={router} />
      </Suspense>
    </AppProvider>,
  );
  return { user, router, storage };
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
