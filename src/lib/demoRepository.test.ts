import { describe, expect, it } from 'vitest';
import { createDemoRepository, STORAGE_KEY, type StoragePort } from './demoRepository';
import { createInitialState } from '../domain/state';

function memoryStorage(value: string | null = null): StoragePort {
  const items = new Map(value ? [[STORAGE_KEY, value]] : []);
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, item) => {
      items.set(key, item);
    },
  };
}
describe('demo persistence boundary', () => {
  it('round-trips preferences and messages', () => {
    const repository = createDemoRepository(memoryStorage());
    const state = createInitialState();
    state.preferences.privacy = 'Privado';
    state.messages.push({
      id: 'message',
      friendId: 'jaime',
      text: 'Hola',
      createdAt: '2026-10-19T12:00:00.000Z',
    });
    expect(repository.save(state)).toBe(true);
    expect(repository.load().state).toEqual(state);
  });
  it.each([
    '{broken',
    '{}',
    '{"version":1}',
    JSON.stringify({ ...createInitialState(), collection: 'bad' }),
  ])('recovers from corrupt or incompatible saved data: %s', (value) => {
    const result = createDemoRepository(memoryStorage(value)).load();
    expect(result.state).toEqual(createInitialState());
    expect(result.warning).not.toBeNull();
  });
  it('rejects invalid saved timestamps before they reach date formatting', () => {
    const state = createInitialState();
    state.syncedAt = 'not a date';
    expect(
      createDemoRepository(memoryStorage(JSON.stringify(state))).load().warning,
    ).not.toBeNull();
  });
  it('works in memory when storage is blocked or full', () => {
    const blocked = {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('quota');
      },
    };
    const repository = createDemoRepository(blocked);
    expect(repository.load().state).toEqual(createInitialState());
    expect(repository.save(createInitialState())).toBe(false);
    expect(createDemoRepository(null).save(createInitialState())).toBe(false);
  });
});
