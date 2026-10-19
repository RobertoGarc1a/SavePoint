import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, Search } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { GameCard } from '../../components/GameCard';
import { PageHeader } from '../../components/PageHeader';
import { games, getGame } from '../../data/games';
import { offers } from '../../data/offers';
import {
  defaultLibraryFilters,
  filterLibrary,
  visibleCollection,
  type LibraryFilters,
} from '../../domain/library';
import { gameStatuses, platforms, type CollectionEntry } from '../../domain/types';

export default function LibraryPage({ wishlist = false }: { wishlist?: boolean }) {
  const { state, dispatch, notify } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selection, setSelection] = useState(defaultLibraryFilters);
  const filters = { ...selection, query: searchParams.get('q') ?? '' };
  const collection: CollectionEntry[] = wishlist
    ? state.wishlist.map(
        (gameId) =>
          state.collection.find((entry) => entry.gameId === gameId) ?? {
            gameId,
            hours: 0,
            status: 'Pendiente',
            platforms: [offers.find((offer) => offer.gameId === gameId)?.platform ?? 'Steam'],
          },
      )
    : visibleCollection(state);
  const result = filterLibrary(collection, filters);
  const reset = () => {
    setSelection(defaultLibraryFilters);
    void setSearchParams({});
  };
  function setFilter<K extends keyof LibraryFilters>(key: K, value: LibraryFilters[K]) {
    setSelection((current) => ({ ...current, [key]: value }));
  }
  return (
    <>
      <PageHeader
        title={wishlist ? 'Tu próxima obsesión.' : 'Todos tus mundos, en orden.'}
        description={
          wishlist
            ? 'Guarda lo que te gusta. Encuentra el momento y el precio.'
            : 'Una biblioteca unificada, sin importar dónde juegues.'
        }
        actions={
          !wishlist && (
            <Button
              onClick={() => {
                dispatch({ type: 'platform/sync', now: new Date().toISOString() });
                notify(
                  'Sincronización simulada completada. No se han consultado cuentas externas.',
                );
              }}
            >
              <RefreshCw size={15} />
              Sincronizar bibliotecas
            </Button>
          )
        }
      />
      {!wishlist && (
        <div className="tabs" aria-label="Filtrar por estado">
          {(['Todos', ...gameStatuses] as const).map((status) => (
            <button
              key={status}
              aria-pressed={filters.status === status}
              className={`tab ${filters.status === status ? 'active' : ''}`}
              onClick={() => setFilter('status', status)}
            >
              {status === 'Todos' ? 'Todos mis juegos' : status}
              <small>
                {collection.filter((entry) => status === 'Todos' || entry.status === status).length}
              </small>
            </button>
          ))}
        </div>
      )}
      <div className="toolbar">
        <label className="search-input">
          <Search size={17} />
          <input
            aria-label="Buscar en la colección"
            placeholder="Buscar en tu colección…"
            value={filters.query}
            onChange={(event) => {
              const params = new URLSearchParams(searchParams);
              if (event.target.value) params.set('q', event.target.value);
              else params.delete('q');
              void setSearchParams(params, { replace: true });
            }}
          />
        </label>
        <select
          aria-label="Filtrar por plataforma"
          value={filters.platform}
          onChange={(event) =>
            setFilter(
              'platform',
              platforms.find((value) => value === event.target.value) ?? 'Todas',
            )
          }
        >
          <option value="Todas">Todas las plataformas</option>
          {platforms.map((platform) => (
            <option key={platform}>{platform}</option>
          ))}
        </select>
        <select
          aria-label="Filtrar por género"
          value={filters.genre}
          onChange={(event) => setFilter('genre', event.target.value)}
        >
          <option value="Todos">Todos los géneros</option>
          {[...new Set(games.map((game) => game.genre))].map((genre) => (
            <option key={genre}>{genre}</option>
          ))}
        </select>
        <select
          aria-label="Ordenar juegos"
          value={filters.sort}
          onChange={(event) => {
            const sort = (['collection', 'hours', 'rating', 'name'] as const).find(
              (value) => value === event.target.value,
            );
            if (sort) setFilter('sort', sort);
          }}
        >
          <option value="collection">Orden de colección</option>
          <option value="hours">Más jugados</option>
          <option value="rating">Mejor valorados</option>
          <option value="name">Nombre A–Z</option>
        </select>
      </div>
      <p className="results-count" aria-live="polite">
        {result.length} juegos en esta vista
        {!wishlist && ' · Una única entrada por juego, con todas tus plataformas.'}
      </p>
      <div className="games-grid">
        {result.map((entry) => (
          <GameCard
            key={entry.gameId}
            game={getGame(entry.gameId)}
            entry={wishlist ? undefined : entry}
          />
        ))}
        {result.length === 0 && (
          <EmptyState
            title="Tu próximo juego está por llegar."
            description="Prueba otros filtros o descubre nuevas aventuras."
            action={<Button onClick={reset}>Limpiar filtros</Button>}
          />
        )}
      </div>
    </>
  );
}
