import { useState } from 'react';
import { useApp } from '../../app/AppContext';
import { getGame } from '../../data/games';
import { formatMoney, formatDate } from '../../lib/format';
import { Dialog } from '../../components/Dialog';
import { EmptyState } from '../../components/EmptyState';

export function OrdersPanel() {
  const { state } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const order = state.orders.find((candidate) => candidate.id === selectedId);
  if (!state.orders.length)
    return (
      <EmptyState
        title="Todavía no hay pedidos."
        description="Configura un agente y simula el mercado para completar el recorrido de compra."
      />
    );
  return (
    <>
      <div className="panel table-scroll">
        <table>
          <thead>
            <tr>
              <th>Juego</th>
              <th>Fecha</th>
              <th>Importe</th>
              <th>Estado</th>
              <th>
                <span className="sr-only">Detalle</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {state.orders.map((entry) => (
              <tr key={entry.id}>
                <td>{getGame(entry.gameId).name}</td>
                <td>{formatDate(entry.createdAt)}</td>
                <td>{formatMoney(entry.priceCents)}</td>
                <td>
                  <span className="pill">Simulado</span>
                </td>
                <td>
                  <button className="text-link" onClick={() => setSelectedId(entry.id)}>
                    Ver detalle →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog
        open={order !== undefined}
        title="Tu pedido de demostración"
        onClose={() => setSelectedId(null)}
      >
        {order && (
          <>
            <span className="pill">COMPRA FICTICIA</span>
            <h3>{getGame(order.gameId).name}</h3>
            <dl className="order-details">
              <dt>Referencia</dt>
              <dd>{order.id}</dd>
              <dt>Fecha</dt>
              <dd>{formatDate(order.createdAt)}</dd>
              <dt>Importe</dt>
              <dd>{formatMoney(order.priceCents)}</dd>
              <dt>Plataforma / región</dt>
              <dd>
                {order.platform} · {order.region}
              </dd>
            </dl>
            <p className="notice">
              No se ha cobrado ningún importe. Este pedido no contiene una clave de activación y no
              tiene validez comercial.
            </p>
          </>
        )}
      </Dialog>
    </>
  );
}
