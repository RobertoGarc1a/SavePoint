import { z } from 'zod';
import { initialCollection } from '../data/collection';
import { gameIds, gameStatuses, platforms } from './types';

const cents = z.number().int().nonnegative().max(100_000_000);
export const purchaseRuleInputSchema = z
  .object({
    gameId: z.enum(gameIds),
    maxPriceCents: cents.min(1).max(20_000),
    budgetCents: cents.min(1).max(20_000),
    minimumFriends: z.number().int().min(0).max(10),
    region: z.enum(['Europa', 'Global']),
  })
  .refine((rule) => rule.budgetCents >= rule.maxPriceCents, {
    message: 'El presupuesto debe ser igual o superior al precio máximo.',
    path: ['budgetCents'],
  });
export type PurchaseRuleInput = z.infer<typeof purchaseRuleInputSchema>;

export const appStateSchema = z.object({
  version: z.literal(2),
  collection: z
    .array(
      z.object({
        gameId: z.enum(gameIds),
        platforms: z.array(z.enum(platforms)),
        status: z.enum(gameStatuses),
        hours: z.number().nonnegative(),
      }),
    )
    .refine((entries) => new Set(entries.map((e) => e.gameId)).size === entries.length),
  connectedPlatforms: z.array(z.enum(platforms)),
  wishlist: z.array(z.enum(gameIds)),
  addedFriends: z.array(z.string()),
  recommendationDecisions: z.record(z.string(), z.enum(['accepted', 'played', 'ignored'])),
  messages: z.array(
    z.object({
      id: z.string(),
      friendId: z.string(),
      text: z.string().max(1000),
      createdAt: z.iso.datetime(),
    }),
  ),
  invitations: z.array(
    z.object({ id: z.string(), friendId: z.string(), gameId: z.enum(gameIds).nullable() }),
  ),
  rules: z.array(
    purchaseRuleInputSchema
      .safeExtend({ id: z.string(), active: z.boolean(), spentCents: cents })
      .refine((rule) => rule.spentCents <= rule.budgetCents),
  ),
  orders: z.array(
    z.object({
      id: z.string(),
      gameId: z.enum(gameIds),
      priceCents: cents,
      region: z.enum(['Europa', 'Global']),
      platform: z.enum(platforms),
      createdAt: z.iso.datetime(),
    }),
  ),
  marketLog: z.array(
    z.object({
      ruleId: z.string(),
      gameId: z.enum(gameIds),
      message: z.string(),
      outcome: z.enum(['purchased', 'waiting', 'skipped']),
    }),
  ),
  seller: z.object({
    minimumCents: cents.min(50).max(975),
    stock: z.number().int().min(0).max(200),
  }),
  preferences: z.object({
    context: z.enum(['exploring', 'playing']),
    privacy: z.enum(['Público', 'Solo amigos', 'Privado']),
    personalization: z.boolean(),
    voice: z.boolean(),
  }),
  syncedAt: z.iso.datetime().nullable(),
});
export type AppState = z.infer<typeof appStateSchema>;
export type PurchaseRule = AppState['rules'][number];

export function createInitialState(): AppState {
  return {
    version: 2,
    collection: structuredClone(initialCollection),
    connectedPlatforms: ['Steam', 'PlayStation', 'Xbox', 'Epic Games'],
    wishlist: ['portal', 'sea'],
    addedFriends: [],
    recommendationDecisions: {},
    messages: [],
    invitations: [],
    rules: [
      {
        id: 'portal-starter',
        gameId: 'portal',
        maxPriceCents: 500,
        budgetCents: 1000,
        spentCents: 0,
        minimumFriends: 1,
        region: 'Europa',
        active: true,
      },
    ],
    orders: [],
    marketLog: [],
    seller: { minimumCents: 195, stock: 120 },
    preferences: {
      context: 'exploring',
      privacy: 'Solo amigos',
      personalization: true,
      voice: false,
    },
    syncedAt: null,
  };
}
