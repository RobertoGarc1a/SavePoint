import { describe, expect, it } from 'vitest';
import { appReducer } from './reducer';
import { createInitialState } from '../domain/state';

describe('state transitions', () => {
  it('deduplicates invitations and accepted recommendations', () => {
    const initial = createInitialState();
    const invite = {
      type: 'social/invite',
      id: 'invite',
      friendId: 'jaime',
      gameId: 'baldurs',
    } as const;
    const twice = appReducer(appReducer(initial, invite), invite);
    expect(twice.invitations).toHaveLength(1);
    const accept = {
      type: 'recommendations/decide',
      id: 'pablo-hades',
      decision: 'accepted',
    } as const;
    const accepted = appReducer(appReducer(twice, accept), accept);
    expect(accepted.wishlist.filter((id) => id === 'hades')).toHaveLength(1);
  });
  it('refuses invalid rules even if the action bypasses the form', () => {
    const initial = createInitialState();
    expect(
      appReducer(initial, {
        type: 'rules/create',
        id: 'bad',
        input: {
          gameId: 'sea',
          maxPriceCents: 2000,
          budgetCents: 100,
          minimumFriends: 0,
          region: 'Europa',
        },
      }),
    ).toBe(initial);
  });
  it('marks a recommended unowned game completed and keeps it visible', () => {
    const state = createInitialState();
    state.connectedPlatforms = [];
    const next = appReducer(state, {
      type: 'recommendations/decide',
      id: 'jaime-portal',
      decision: 'played',
    });
    expect(next.collection.find((entry) => entry.gameId === 'portal')?.status).toBe('Completado');
    expect(next.connectedPlatforms).toContain('Steam');
  });
  it('resets all user actions to a fresh seed', () => {
    const changed = appReducer(createInitialState(), {
      type: 'market/simulate',
      batchId: 'batch',
      now: '2026-10-19T12:00:00.000Z',
    });
    expect(appReducer(changed, { type: 'demo/reset' })).toEqual(createInitialState());
  });
});
