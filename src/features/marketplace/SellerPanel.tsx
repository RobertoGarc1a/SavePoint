import { useState } from 'react';
import { useApp } from '../../app/AppContext';
import { sellerPriceCents } from '../../domain/marketplace';
import { formatMoney } from '../../lib/format';
import { Button } from '../../components/Button';
import { useAccess } from '../../app/AccessContext';

export function SellerPanel() {
  const { state, dispatch, notify } = useApp();
  const { account } = useAccess();
  const [stock, setStock] = useState(state.seller.stock);
  const [minimum, setMinimum] = useState((state.seller.minimumCents / 100).toFixed(2));
  const cents = Math.round(Number(minimum) * 100);
  const valid = Number.isInteger(cents) && cents >= 50 && cents <= 975;
  if (account?.role !== 'admin') return null;
  return (
    <div className="two-columns">
      <section className="panel">
        <p className="eyebrow">MACHINE SELLERS · DISTRIBUIDOR DEMO</p>
        <h2>Tu inventario marca el ritmo.</h2>
        <p className="muted body-copy">
          Simula cómo un distribuidor ajustaría el precio de Portal 2 sin bajar de un umbral. Estos
          valores pertenecen al escenario de la cuenta admin; no modifican el inventario de la otra
          cuenta.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!valid) return;
            dispatch({ type: 'seller/update', stock, minimumCents: cents });
            notify('Regla guardada. Se aplica a las ofertas y a la siguiente simulación.');
          }}
        >
          <label className="field">
            Inventario de claves: {stock}
            <input
              type="range"
              min="0"
              max="200"
              step="1"
              value={stock}
              onChange={(event) => setStock(Number(event.target.value))}
            />
          </label>
          <label className="field">
            Precio mínimo permitido (€)
            <input
              type="number"
              min="0.50"
              max="9.75"
              step="0.01"
              value={minimum}
              onChange={(event) => setMinimum(event.target.value)}
              required
            />
          </label>
          <p className="notice">
            Precio calculado:{' '}
            <strong>
              {valid ? formatMoney(sellerPriceCents(stock, cents)) : 'Introduce un mínimo válido'}
            </strong>
          </p>
          <Button type="submit" variant="primary" disabled={!valid}>
            Guardar regla de ejemplo
          </Button>
        </form>
      </section>
      <aside className="panel">
        <h3>Regla visible y controlada.</h3>
        <p className="body-copy muted">
          Precio = máximo entre tu mínimo y 9,75 € menos 0,07 € por clave en stock.
          <br />
          <br />
          El precio se calcula en céntimos enteros. Cada pedido de Portal 2 consume una clave y
          obliga a recalcular la siguiente oferta.
        </p>
        <p className="notice">
          Con stock cero no se ejecutan pedidos. Ninguna clave real se almacena o genera.
        </p>
      </aside>
    </div>
  );
}
