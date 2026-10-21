import { lazy } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from './Layout';
import { EmptyState } from '../components/EmptyState';
import { MarketplaceAccess, RequireAdmin, RequireSession } from './AccessGuards';

const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const LibraryPage = lazy(() => import('../features/library/LibraryPage'));
const DiscoverPage = lazy(() => import('../features/discovery/DiscoverPage'));
const GameDetailPage = lazy(() => import('../features/library/GameDetailPage'));
const FriendsPage = lazy(() => import('../features/social/FriendsPage'));
const RecommendationsPage = lazy(() => import('../features/social/RecommendationsPage'));
const MarketplacePage = lazy(() => import('../features/marketplace/MarketplacePage'));
const PlatformsPage = lazy(() => import('../features/settings/PlatformsPage'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'));
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const AdminPage = lazy(() => import('../features/admin/AdminPage'));

export const routes = [
  { path: '/login', element: <LoginPage /> },
  {
    element: (
      <RequireSession>
        <Layout />
      </RequireSession>
    ),
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/library', element: <LibraryPage /> },
      { path: '/wishlist', element: <LibraryPage key="wishlist" wishlist /> },
      { path: '/games/:gameId', element: <GameDetailPage /> },
      { path: '/discover', element: <DiscoverPage /> },
      { path: '/friends', element: <FriendsPage /> },
      { path: '/recommendations', element: <RecommendationsPage /> },
      {
        path: '/marketplace',
        element: (
          <MarketplaceAccess>
            <MarketplacePage />
          </MarketplaceAccess>
        ),
      },
      { path: '/platforms', element: <PlatformsPage /> },
      { path: '/settings', element: <SettingsPage /> },
      {
        path: '/admin',
        element: (
          <RequireAdmin>
            <AdminPage />
          </RequireAdmin>
        ),
      },
      {
        path: '*',
        element: (
          <EmptyState
            title="Te has salido del mapa."
            description="Esta ruta no existe. Tu próxima aventura empieza en tu espacio."
            action={
              <Link className="button primary" to="/">
                Volver a mi espacio
              </Link>
            }
          />
        ),
      },
    ],
  },
];
