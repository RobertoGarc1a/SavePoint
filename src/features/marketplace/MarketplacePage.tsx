import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, ShieldCheck } from 'lucide-react';
import { games } from '../../data/games';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import type { GameId } from '../../domain/types';
import { AgentForm } from './AgentForm';
import { AgentsPanel } from './AgentsPanel';
import { OffersPanel } from './OffersPanel';
import { OrdersPanel } from './OrdersPanel';
import { SellerPanel } from './SellerPanel';
import { useAccess } from '../../app/AccessContext';

const tabs = [
  { id: 'offers', label: 'Ofertas' },
  { id: 'agents', label: 'Mis agentes' },
  { id: 'orders', label: 'Mis pedidos' },
  { id: 'seller', label: 'Panel del distribuidor' },
] as const;
export default function MarketplacePage() {
  const { account, settings } = useAccess();
  const visibleTabs = tabs.filter(
    (candidate) => candidate.id !== 'seller' || account?.role === 'admin',
  );
  const [params, setParams] = useSearchParams();
  const requestedGame = games.find((game) => game.id === params.get('game'))?.id;
  const [editing, setEditing] = useState<GameId | null>(null);
  const tab = visibleTabs.find((candidate) => candidate.id === params.get('tab'))?.id ?? 'offers';
  const selected = editing ?? requestedGame ?? null;
  const close = () => {
    setEditing(null);
    const next = new URLSearchParams(params);
    next.delete('game');
    void setParams(next, { replace: true });
  };
  return (
    <>
      <PageHeader
        title="Que la próxima oferta te encuentre."
        description="Ofertas, reglas y agentes de compra en un mismo lugar."
        actions={
          <Button variant="primary" onClick={() => setEditing('portal')}>
            <Plus size={16} />
            Crear agente de compra
          </Button>
        }
      />
      <div className="banner">
        <ShieldCheck />
        <div>
          <strong>Tu presupuesto siempre tiene la última palabra.</strong>
          <p>
            Precios, vendedores y pedidos ficticios. No se realizan pagos ni se generan claves
            reales.
          </p>
        </div>
        <span className="pill">Marketplace demo</span>
      </div>
      {!settings.simulationsEnabled && (
        <p className="notice" role="status">
          El administrador ha pausado las simulaciones de compra. Puedes seguir consultando ofertas,
          agentes y pedidos.
        </p>
      )}
      <div className="tabs">
        {visibleTabs.map(({ id, label }) => (
          <button
            key={id}
            className={`tab ${tab === id ? 'active' : ''}`}
            aria-pressed={tab === id}
            onClick={() => {
              setEditing(null);
              void setParams({ tab: id });
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'offers' && <OffersPanel onCreate={setEditing} />}
      {tab === 'agents' && <AgentsPanel onCreate={() => setEditing('portal')} />}
      {tab === 'orders' && <OrdersPanel />}
      {tab === 'seller' && <SellerPanel />}
      <Dialog open={selected !== null} title="Tu agente. Tus reglas." onClose={close}>
        {selected && (
          <AgentForm
            key={selected}
            initialGame={selected}
            onCreated={() => {
              setEditing(null);
              void setParams({ tab: 'agents' });
            }}
          />
        )}
      </Dialog>
    </>
  );
}
