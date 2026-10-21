import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { useAccess } from './AccessContext';

export function RequireSession({ children }: { children: ReactNode }) {
  const { account } = useAccess();
  const location = useLocation();
  if (!account)
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { account } = useAccess();
  if (account?.role !== 'admin')
    return (
      <EmptyState
        title="Acceso reservado al administrador."
        description="Tu cuenta de jugador puede usar SavePoint, pero no cambiar sus ajustes generales."
        action={
          <Link className="button primary" to="/">
            Volver a mi espacio
          </Link>
        }
      />
    );
  return children;
}

export function MarketplaceAccess({ children }: { children: ReactNode }) {
  const { settings } = useAccess();
  if (!settings.marketplaceEnabled)
    return (
      <EmptyState
        title="El marketplace está en pausa."
        description="El administrador ha desactivado temporalmente el marketplace de la demo."
        action={
          <Link className="button primary" to="/">
            Volver a mi espacio
          </Link>
        }
      />
    );
  return children;
}
