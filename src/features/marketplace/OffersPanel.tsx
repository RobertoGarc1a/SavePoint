import { useState } from 'react';
import { Bot, Search } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { getGame } from '../../data/games';
import { offers } from '../../data/offers';
import { sellerPriceCents } from '../../domain/marketplace';
import type { GameId } from '../../domain/types';
import { Button } from '../../components/Button';
import { GameCover } from '../../components/GameCover';
import { EmptyState } from '../../components/EmptyState';
import { Dialog } from '../../components/Dialog';
import { formatMoney } from '../../lib/format';

export function OffersPanel({ onCreate }: { onCreate: (gameId: GameId) => void }) {
  const { state } = useApp();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<GameId | null>(null);
  const result = offers.filter((offer) =>
    getGame(offer.gameId).name.toLowerCase().includes(query.toLowerCase()),
  );
  const selected = history ? offers.find((offer) => offer.gameId === history) : undefined;
  return (
    <>
      <div className="toolbar">
        <label className="search-input">
          <Search size={17} />
          <input
            aria-label="Buscar ofertas"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Encuentra tu próxima aventura…"
          />
        </label>
        <span className="muted">Precios ficticios · Claves digitales · EUR</span>
      </div>
      <div className="offer-grid">
        {result.map((offer) => {
          const game = getGame(offer.gameId);
          const price =
            offer.gameId === 'portal'
              ? sellerPriceCents(state.seller.stock, state.seller.minimumCents)
              : offer.priceCents;
          const owned = state.collection.some((entry) => entry.gameId === game.id);
          return (
            <article className="offer-card" key={game.id}>
              <div className="card-art">
                <GameCover game={game} />
                <span className="card-score">
                  −{Math.round((1 - price / offer.originalCents) * 100)}%
                </span>
              </div>
              <div className="offer-body">
                <h3>{game.name}</h3>
                <small>
                  {offer.platform} · {offer.region} · {offer.seller}
                </small>
                <p className="price">
                  {formatMoney(price)} <del>{formatMoney(offer.originalCents)}</del>
                </p>
                <Button size="small" onClick={() => onCreate(game.id)} disabled={owned}>
                  <Bot size={15} />
                  {owned ? 'Ya en tu biblioteca' : 'Crear regla de compra'}
                </Button>
                <button className="text-link" onClick={() => setHistory(game.id)}>
                  Historial ilustrativo de precios →
                </button>
              </div>
            </article>
          );
        })}
        {result.length === 0 && (
          <EmptyState
            title="No encontramos esa aventura."
            description="Prueba con Portal, Hades o Elden Ring."
          />
        )}
      </div>
      <Dialog
        open={history !== null}
        title="Una oferta con perspectiva."
        onClose={() => setHistory(null)}
      >
        {selected && (
          <>
            <h3>{getGame(selected.gameId).name}</h3>
            <p>
              Serie ficticia de 30 días para representar la consulta del historial. No son precios
              históricos reales.
            </p>
            <svg
              className="price-chart"
              viewBox="0 0 480 110"
              role="img"
              aria-label="Tendencia ficticia de descenso de precio durante 30 días"
            >
              <path d="M20 15h440M20 55h440M20 90h440" stroke="#38452d" />
              <path
                d="m20 20 70 0 30 25 80-3 60 20 60-5 70 23 70 0"
                fill="none"
                stroke="#d5f365"
                strokeWidth="3"
              />
              <text x="20" y="108">
                Hace 30 días
              </text>
              <text x="430" y="108">
                Hoy
              </text>
            </svg>
            <p className="notice">
              Precio base del ejemplo: {formatMoney(selected.originalCents)}. La oferta de Portal 2
              se actualiza según la regla del distribuidor.
            </p>
          </>
        )}
      </Dialog>
    </>
  );
}
