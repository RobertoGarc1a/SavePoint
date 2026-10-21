import { Pause, Play, Trash2 } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { getGame } from '../../data/games';
import { formatMoney } from '../../lib/format';
import { useAccess } from '../../app/AccessContext';

export function AgentsPanel({ onCreate }: { onCreate: () => void }) {
  const { state, dispatch, notify } = useApp();
  const { settings } = useAccess();
  const active = state.rules.some((rule) => rule.active);
  return (
    <div className="two-columns">
      <section>
        <div className="section-heading">
          <div>
            <h2>Compras bajo tus condiciones</h2>
            <p className="muted">Se ejecutan únicamente al simular el mercado.</p>
          </div>
          <Button
            variant="primary"
            size="small"
            disabled={!active || !settings.simulationsEnabled}
            onClick={() => {
              dispatch({
                type: 'market/simulate',
                batchId: crypto.randomUUID(),
                now: new Date().toISOString(),
              });
              notify('Simulación terminada. Consulta el resultado de cada regla.');
            }}
          >
            <Play size={14} />
            Simular mercado
          </Button>
        </div>
        <div className="agent-list">
          {state.rules.map((rule) => (
            <article className={`panel agent-card ${rule.active ? 'enabled' : ''}`} key={rule.id}>
              <div className="section-heading">
                <h3>{getGame(rule.gameId).name}</h3>
                <span className="pill">{rule.active ? 'Esperando condiciones' : 'En pausa'}</span>
              </div>
              <p>
                Comprar si el precio es ≤{' '}
                <strong className="lime">{formatMoney(rule.maxPriceCents)}</strong>
                <br />
                Al menos {rule.minimumFriends} amigos con el juego · Región {rule.region}
                <br />
                Presupuesto restante:{' '}
                <strong>{formatMoney(rule.budgetCents - rule.spentCents)}</strong>
              </p>
              <p className="fine-print">
                Una unidad por regla. Se pausa automáticamente tras la compra.
              </p>
              <div className="button-row">
                <Button
                  size="small"
                  variant="ghost"
                  onClick={() => dispatch({ type: 'rules/toggle', id: rule.id })}
                >
                  {rule.active ? <Pause size={14} /> : <Play size={14} />}
                  {rule.active ? 'Pausar' : 'Reactivar'}
                </Button>
                <Button
                  size="small"
                  variant="ghost"
                  onClick={() => dispatch({ type: 'rules/delete', id: rule.id })}
                >
                  <Trash2 size={14} />
                  Eliminar
                </Button>
              </div>
            </article>
          ))}
          {state.rules.length === 0 && (
            <EmptyState
              title="Tu agente espera instrucciones."
              description="Elige un juego, un precio máximo y tu límite de gasto."
              action={<Button onClick={onCreate}>Crear agente</Button>}
            />
          )}
        </div>
      </section>
      <aside className="panel">
        <h3>Tu presupuesto tiene la última palabra.</h3>
        <p className="muted body-copy">
          El agente comprueba precio, presupuesto restante, región, amigos y stock. Evita compras
          duplicadas aunque desconectes una plataforma.
        </p>
        <p className="notice">
          La regla inicial de Portal 2 está lista para probar. Ejecuta la simulación para completar
          el recorrido.
        </p>
        {state.marketLog.length > 0 && (
          <>
            <h3 className="subheading">Última simulación</h3>
            <div className="market-log" aria-live="polite">
              {state.marketLog.map((entry) => (
                <div key={entry.ruleId} className={`log-entry ${entry.outcome}`}>
                  <strong>{getGame(entry.gameId).name}</strong>
                  <p>{entry.message}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
