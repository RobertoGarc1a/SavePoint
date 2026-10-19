import { receivedRecommendations } from '../data/friends';
import { offers } from '../data/offers';
import { simulateMarket, validateNewRule } from '../domain/marketplace';
import { createInitialState, type AppState, type PurchaseRuleInput } from '../domain/state';
import type { GameId, GameStatus, Platform } from '../domain/types';

export type Action =
  | { type: 'wishlist/toggle'; gameId: GameId }
  | { type: 'library/status'; gameId: GameId; status: GameStatus }
  | { type: 'platform/toggle'; platform: Platform }
  | { type: 'platform/sync'; now: string }
  | { type: 'preferences/update'; patch: Partial<AppState['preferences']> }
  | { type: 'friends/add'; friendId: string }
  | { type: 'social/message'; id: string; friendId: string; text: string; now: string }
  | { type: 'social/invite'; id: string; friendId: string; gameId: GameId | null }
  | { type: 'recommendations/decide'; id: string; decision: 'accepted' | 'played' | 'ignored' }
  | { type: 'rules/create'; id: string; input: PurchaseRuleInput }
  | { type: 'rules/toggle'; id: string }
  | { type: 'rules/delete'; id: string }
  | { type: 'market/simulate'; batchId: string; now: string }
  | { type: 'seller/update'; minimumCents: number; stock: number }
  | { type: 'demo/reset' };

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'wishlist/toggle':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.gameId)
          ? state.wishlist.filter((id) => id !== action.gameId)
          : [...state.wishlist, action.gameId],
      };
    case 'library/status':
      return {
        ...state,
        collection: state.collection.map((entry) =>
          entry.gameId === action.gameId ? { ...entry, status: action.status } : entry,
        ),
      };
    case 'platform/toggle':
      return {
        ...state,
        connectedPlatforms: state.connectedPlatforms.includes(action.platform)
          ? state.connectedPlatforms.filter((platform) => platform !== action.platform)
          : [...state.connectedPlatforms, action.platform],
      };
    case 'platform/sync':
      return { ...state, syncedAt: action.now };
    case 'preferences/update':
      return { ...state, preferences: { ...state.preferences, ...action.patch } };
    case 'friends/add':
      return state.addedFriends.includes(action.friendId)
        ? state
        : { ...state, addedFriends: [...state.addedFriends, action.friendId] };
    case 'social/message': {
      const text = action.text.trim().slice(0, 1000);
      return text
        ? {
            ...state,
            messages: [
              ...state.messages,
              { id: action.id, friendId: action.friendId, text, createdAt: action.now },
            ],
          }
        : state;
    }
    case 'social/invite':
      return state.invitations.some(
        (invite) => invite.friendId === action.friendId && invite.gameId === action.gameId,
      )
        ? state
        : {
            ...state,
            invitations: [
              ...state.invitations,
              { id: action.id, friendId: action.friendId, gameId: action.gameId },
            ],
          };
    case 'recommendations/decide': {
      const recommendation = receivedRecommendations.find((entry) => entry.id === action.id);
      if (!recommendation || state.recommendationDecisions[action.id]) return state;
      const next = {
        ...state,
        recommendationDecisions: { ...state.recommendationDecisions, [action.id]: action.decision },
      };
      if (action.decision === 'accepted' && !next.wishlist.includes(recommendation.gameId))
        next.wishlist = [...next.wishlist, recommendation.gameId];
      if (action.decision === 'played') {
        const owned = next.collection.some((entry) => entry.gameId === recommendation.gameId);
        if (owned)
          next.collection = next.collection.map((entry) =>
            entry.gameId === recommendation.gameId ? { ...entry, status: 'Completado' } : entry,
          );
        else {
          const offer = offers.find((candidate) => candidate.gameId === recommendation.gameId);
          if (offer) {
            next.collection = [
              ...next.collection,
              {
                gameId: recommendation.gameId,
                platforms: [offer.platform],
                hours: 0,
                status: 'Completado',
              },
            ];
            if (!next.connectedPlatforms.includes(offer.platform))
              next.connectedPlatforms = [...next.connectedPlatforms, offer.platform];
          }
        }
      }
      return next;
    }
    case 'rules/create':
      return validateNewRule(state, action.input)
        ? state
        : {
            ...state,
            rules: [
              ...state.rules,
              { ...action.input, id: action.id, active: true, spentCents: 0 },
            ],
          };
    case 'rules/toggle':
      return {
        ...state,
        rules: state.rules.map((rule) =>
          rule.id === action.id ? { ...rule, active: !rule.active } : rule,
        ),
      };
    case 'rules/delete':
      return { ...state, rules: state.rules.filter((rule) => rule.id !== action.id) };
    case 'market/simulate':
      return simulateMarket(state, action.batchId, action.now);
    case 'seller/update':
      return Number.isInteger(action.minimumCents) &&
        action.minimumCents >= 50 &&
        action.minimumCents <= 975 &&
        Number.isInteger(action.stock) &&
        action.stock >= 0 &&
        action.stock <= 200
        ? { ...state, seller: { minimumCents: action.minimumCents, stock: action.stock } }
        : state;
    case 'demo/reset':
      return createInitialState();
  }
}
