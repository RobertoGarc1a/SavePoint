import { games } from '../data/games';
import type { AppState } from './state';
import type { CollectionEntry, GameStatus, Platform } from './types';

export interface LibraryFilters {
  query: string;
  status: GameStatus | 'Todos';
  platform: Platform | 'Todas';
  genre: string;
  sort: 'collection' | 'hours' | 'rating' | 'name';
}
export const defaultLibraryFilters: LibraryFilters = {
  query: '',
  status: 'Todos',
  platform: 'Todas',
  genre: 'Todos',
  sort: 'collection',
};
export const visibleCollection = (state: AppState) =>
  state.collection.filter((entry) =>
    entry.platforms.some((platform) => state.connectedPlatforms.includes(platform)),
  );
export function filterLibrary(entries: CollectionEntry[], filters: LibraryFilters) {
  const getGame = (id: string) => games.find((game) => game.id === id);
  const result = entries.filter((entry) => {
    const game = getGame(entry.gameId);
    return (
      game &&
      game.name.toLocaleLowerCase('es').includes(filters.query.toLocaleLowerCase('es')) &&
      (filters.status === 'Todos' || entry.status === filters.status) &&
      (filters.platform === 'Todas' || entry.platforms.includes(filters.platform)) &&
      (filters.genre === 'Todos' || game.genre === filters.genre)
    );
  });
  if (filters.sort === 'hours') result.sort((a, b) => b.hours - a.hours);
  if (filters.sort === 'rating')
    result.sort((a, b) => (getGame(b.gameId)?.rating ?? 0) - (getGame(a.gameId)?.rating ?? 0));
  if (filters.sort === 'name')
    result.sort((a, b) =>
      (getGame(a.gameId)?.name ?? '').localeCompare(getGame(b.gameId)?.name ?? '', 'es'),
    );
  return result;
}
