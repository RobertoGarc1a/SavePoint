import { useState } from 'react';
import { Bot } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { games } from '../../data/games';
import { validateNewRule } from '../../domain/marketplace';
import type { PurchaseRuleInput } from '../../domain/state';
import type { GameId } from '../../domain/types';
import { Button } from '../../components/Button';

export function AgentForm({
  initialGame = 'portal',
  onCreated,
}: {
  initialGame?: GameId;
  onCreated: () => void;
}) {
  const { state, dispatch, notify } = useApp();
  const [gameId, setGameId] = useState(initialGame);
  const [maximum, setMaximum] = useState('5.00');
  const [budget, setBudget] = useState('10.00');
  const [minimumFriends, setMinimumFriends] = useState(1);
  const [region, setRegion] = useState<PurchaseRuleInput['region']>('Europa');
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const input = {
          gameId,
          maxPriceCents: Math.round(Number(maximum) * 100),
          budgetCents: Math.round(Number(budget) * 100),
          minimumFriends,
          region,
        };
        const problem = validateNewRule(state, input);
        if (problem) {
          setError(problem);
          return;
        }
        dispatch({ type: 'rules/create', id: crypto.randomUUID(), input });
        notify('Agente activado. Pulsa «Simular mercado» para comprobar sus condiciones.');
        onCreated();
      }}
    >
      <p>Define cuándo puede comprar tu Machine Customer. Solo se crearán pedidos ficticios.</p>
      <label className="field">
        Juego
        <select
          value={gameId}
          onChange={(event) => {
            const game = games.find((candidate) => candidate.id === event.target.value);
            if (game) {
              setGameId(game.id);
              setError(null);
            }
          }}
        >
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
              {state.collection.some((entry) => entry.gameId === game.id)
                ? ' · Ya en tu biblioteca'
                : ''}
            </option>
          ))}
        </select>
      </label>
      <div className="fields-row">
        <label className="field">
          Precio máximo (€)
          <input
            type="number"
            min="0.01"
            max="200"
            step="0.01"
            value={maximum}
            onChange={(event) => setMaximum(event.target.value)}
            required
          />
        </label>
        <label className="field">
          Presupuesto de esta regla (€)
          <input
            type="number"
            min="0.01"
            max="200"
            step="0.01"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            required
          />
        </label>
      </div>
      <div className="fields-row">
        <label className="field">
          Mínimo de amigos con el juego
          <select
            value={minimumFriends}
            onChange={(event) => setMinimumFriends(Number(event.target.value))}
          >
            {[0, 1, 2, 3, 4].map((count) => (
              <option key={count} value={count}>
                {count === 0 ? 'Sin condición' : `${count} amigo${count === 1 ? '' : 's'}`}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Región de la clave
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value === 'Global' ? 'Global' : 'Europa')}
          >
            <option>Europa</option>
            <option>Global</option>
          </select>
        </label>
      </div>
      <p className="notice">
        Una unidad por regla. «Global» exige una clave global; las ofertas de esta demo son
        europeas. No se compra un juego que ya poseas.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" variant="primary">
        <Bot size={16} />
        Activar agente de demostración
      </Button>
    </form>
  );
}
