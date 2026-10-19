import { offers } from '../data/offers';
import type { AppState, PurchaseRuleInput } from './state';
import { purchaseRuleInputSchema } from './state';
import { activeFriends } from './social';
import { formatMoney } from '../lib/format';

export function validateNewRule(state: AppState, input: PurchaseRuleInput): string | null {
  const result = purchaseRuleInputSchema.safeParse(input);
  if (!result.success) return result.error.issues[0]?.message ?? 'Comprueba las condiciones.';
  if (state.collection.some((entry) => entry.gameId === input.gameId))
    return 'Ya tienes este juego en tu biblioteca.';
  if (state.rules.some((rule) => rule.gameId === input.gameId && rule.active))
    return 'Ya existe un agente activo para este juego.';
  return null;
}

export function sellerPriceCents(stock: number, minimumCents: number): number {
  return Math.max(minimumCents, 975 - stock * 7);
}

/** Pure transaction simulation. No network calls, timers or mutation of the input state. */
export function simulateMarket(state: AppState, batchId: string, now: string): AppState {
  const next = structuredClone(state);
  next.marketLog = [];
  for (const rule of next.rules) {
    if (!rule.active) continue;
    const offer = offers.find((candidate) => candidate.gameId === rule.gameId);
    const log = (outcome: AppState['marketLog'][number]['outcome'], message: string) =>
      next.marketLog.push({ ruleId: rule.id, gameId: rule.gameId, outcome, message });
    if (next.collection.some((entry) => entry.gameId === rule.gameId)) {
      rule.active = false;
      log('skipped', 'Ya está en tu biblioteca. Regla pausada para evitar duplicados.');
      continue;
    }
    if (!offer) {
      log('waiting', 'No hay ofertas disponibles.');
      continue;
    }
    const price =
      rule.gameId === 'portal'
        ? sellerPriceCents(next.seller.stock, next.seller.minimumCents)
        : offer.priceCents;
    if (price > rule.maxPriceCents) {
      log('waiting', `${formatMoney(price)} supera el precio máximo.`);
      continue;
    }
    if (price > rule.budgetCents - rule.spentCents) {
      log('waiting', 'El presupuesto restante es insuficiente.');
      continue;
    }
    if (rule.region === 'Global') {
      log('waiting', 'La oferta es europea. Tu regla exige una clave global.');
      continue;
    }
    const count = activeFriends(next).filter((friend) =>
      friend.library.some((entry) => entry.gameId === rule.gameId),
    ).length;
    if (count < rule.minimumFriends) {
      log('waiting', `${count} amigos tienen el juego; tu condición exige ${rule.minimumFriends}.`);
      continue;
    }
    if (rule.gameId === 'portal' && next.seller.stock === 0) {
      log('waiting', 'El distribuidor no tiene stock.');
      continue;
    }
    next.orders.unshift({
      id: `${batchId}-${rule.id}`,
      gameId: rule.gameId,
      priceCents: price,
      region: offer.region,
      platform: offer.platform,
      createdAt: now,
    });
    next.collection.push({
      gameId: rule.gameId,
      platforms: [offer.platform],
      status: 'Pendiente',
      hours: 0,
    });
    if (!next.connectedPlatforms.includes(offer.platform))
      next.connectedPlatforms.push(offer.platform);
    next.wishlist = next.wishlist.filter((id) => id !== rule.gameId);
    if (rule.gameId === 'portal') next.seller.stock -= 1;
    rule.spentCents += price;
    rule.active = false;
    log('purchased', `Pedido simulado por ${formatMoney(price)}. Añadido a tu biblioteca.`);
  }
  return next;
}
