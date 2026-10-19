import { describe, expect, it } from 'vitest';
import { createInitialState } from './state';
import { defaultLibraryFilters, filterLibrary, visibleCollection } from './library';
import { sharedCooperativeGames } from './social';

describe('unified library', () => {
  it('keeps the platform list on a single entry for the same game', () => {
    const result = filterLibrary(createInitialState().collection, {
      ...defaultLibraryFilters,
      query: 'HADES',
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.platforms).toEqual(['Steam', 'Epic Games']);
  });
  it('combines platform, genre, status and query filters', () => {
    const result = filterLibrary(createInitialState().collection, {
      ...defaultLibraryFilters,
      platform: 'Steam',
      genre: 'RPG',
      status: 'Jugando',
      query: 'baldur',
    });
    expect(result.map((entry) => entry.gameId)).toEqual(['baldurs']);
  });
  it('hides exclusive titles on unlink without deleting owned data', () => {
    const state = createInitialState();
    state.connectedPlatforms = ['Steam'];
    expect(visibleCollection(state).map((entry) => entry.gameId)).not.toContain('cyberpunk');
    expect(visibleCollection(state).map((entry) => entry.gameId)).toContain('hades');
    expect(state.collection).toHaveLength(8);
  });
  it('sorts without mutating the source collection', () => {
    const state = createInitialState();
    const original = structuredClone(state.collection);
    expect(
      filterLibrary(state.collection, { ...defaultLibraryFilters, sort: 'hours' })[0]?.gameId,
    ).toBe('elden');
    expect(state.collection).toEqual(original);
  });
});

describe('cooperative comparison', () => {
  it('requires at least one known friend', () => {
    expect(sharedCooperativeGames(createInitialState(), [])).toEqual([]);
    expect(sharedCooperativeGames(createInitialState(), ['missing'])).toEqual([]);
  });
  it('finds the compatible intersection for Jaime and the player', () => {
    expect(sharedCooperativeGames(createInitialState(), ['jaime']).map((game) => game.id)).toEqual([
      'baldurs',
      'it-takes',
      'stardew',
    ]);
  });
  it('rejects shared titles when the platforms are incompatible', () => {
    expect(sharedCooperativeGames(createInitialState(), ['jaime', 'pablo'])).toEqual([]);
  });
  it('uses a connected platform from the entire owned list, not only the first one', () => {
    const state = createInitialState();
    state.connectedPlatforms = ['Xbox'];
    expect(sharedCooperativeGames(state, ['luis']).map((game) => game.id)).toEqual([
      'it-takes',
      'stardew',
      'deep-rock',
    ]);
  });
});
