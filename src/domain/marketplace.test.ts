import { describe, expect, it } from 'vitest';
import { appStateSchema, createInitialState, type PurchaseRuleInput } from './state';
import { sellerPriceCents, simulateMarket, validateNewRule } from './marketplace';

const now = '2026-10-19T12:00:00.000Z';
const input: PurchaseRuleInput = {
  gameId: 'sea',
  maxPriceCents: 2000,
  budgetCents: 2500,
  minimumFriends: 1,
  region: 'Europa',
};

describe('purchase rule validation', () => {
  it('accepts an unowned game within budget', () =>
    expect(validateNewRule(createInitialState(), input)).toBeNull());
  it('rejects a cap larger than the budget', () =>
    expect(validateNewRule(createInitialState(), { ...input, budgetCents: 1000 })).toContain(
      'presupuesto',
    ));
  it('rejects fractional cents and invalid amounts', () => {
    for (const amount of [0, -10, 100.5, NaN, Infinity])
      expect(
        validateNewRule(createInitialState(), { ...input, maxPriceCents: amount }),
      ).not.toBeNull();
  });
  it('rejects games already owned even if their platform is disconnected', () => {
    const state = createInitialState();
    state.connectedPlatforms = [];
    expect(validateNewRule(state, { ...input, gameId: 'elden' })).toContain('Ya tienes');
  });
  it('rejects duplicate active rules', () =>
    expect(validateNewRule(createInitialState(), { ...input, gameId: 'portal' })).toContain(
      'agente activo',
    ));
});

describe('market simulation', () => {
  it('records one order, consumes stock, moves the wish to the library and pauses the rule atomically', () => {
    const state = createInitialState();
    const next = simulateMarket(state, 'batch', now);
    expect(next.orders).toEqual([
      expect.objectContaining({ gameId: 'portal', priceCents: 195, createdAt: now }),
    ]);
    expect(next.collection.some((entry) => entry.gameId === 'portal')).toBe(true);
    expect(next.wishlist).not.toContain('portal');
    expect(next.rules[0]).toMatchObject({ active: false, spentCents: 195 });
    expect(next.seller.stock).toBe(119);
    expect(next.marketLog[0]?.outcome).toBe('purchased');
    expect(appStateSchema.safeParse(next).success).toBe(true);
    expect(state).toEqual(createInitialState());
  });
  it('is safe to repeat and refuses a reactivated rule for an owned game', () => {
    const purchased = simulateMarket(createInitialState(), 'first', now);
    expect(simulateMarket(purchased, 'second', now).orders).toHaveLength(1);
    purchased.rules[0]!.active = true;
    const replay = simulateMarket(purchased, 'third', now);
    expect(replay.orders).toHaveLength(1);
    expect(replay.marketLog[0]?.outcome).toBe('skipped');
  });
  it.each([
    [
      'price',
      (state: ReturnType<typeof createInitialState>) => {
        state.rules[0]!.maxPriceCents = 100;
      },
      'precio máximo',
    ],
    [
      'budget',
      (state: ReturnType<typeof createInitialState>) => {
        state.rules[0]!.spentCents = 950;
      },
      'presupuesto',
    ],
    [
      'friends',
      (state: ReturnType<typeof createInitialState>) => {
        state.rules[0]!.minimumFriends = 4;
      },
      'amigos',
    ],
    [
      'region',
      (state: ReturnType<typeof createInitialState>) => {
        state.rules[0]!.region = 'Global';
      },
      'clave global',
    ],
    [
      'stock',
      (state: ReturnType<typeof createInitialState>) => {
        state.seller.stock = 0;
        state.rules[0]!.maxPriceCents = 1000;
      },
      'stock',
    ],
  ])('waits when the %s condition fails', (_name, change, message) => {
    const state = createInitialState();
    change(state);
    const next = simulateMarket(state, 'batch', now);
    expect(next.orders).toHaveLength(0);
    expect(next.marketLog[0]?.message).toContain(message);
    expect(next.rules[0]?.active).toBe(true);
  });
  it('prevents two agents from acquiring the same title in the same batch', () => {
    const state = createInitialState();
    state.rules.push({ ...state.rules[0]!, id: 'duplicate' });
    const next = simulateMarket(state, 'batch', now);
    expect(next.orders).toHaveLength(1);
    expect(next.seller.stock).toBe(119);
  });
  it('does not sell below the configured minimum at any inventory level', () => {
    for (let stock = 0; stock <= 200; stock++) {
      expect(sellerPriceCents(stock, 195)).toBeGreaterThanOrEqual(195);
      expect(Number.isInteger(sellerPriceCents(stock, 195))).toBe(true);
    }
  });
});
