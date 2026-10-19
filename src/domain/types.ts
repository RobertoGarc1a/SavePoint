export const gameIds = [
  'elden',
  'baldurs',
  'hades',
  'hollow',
  'it-takes',
  'cyberpunk',
  'stardew',
  'deep-rock',
  'portal',
  'sea',
] as const;
export type GameId = (typeof gameIds)[number];
export const platforms = ['Steam', 'PlayStation', 'Xbox', 'Epic Games', 'Nintendo', 'GOG'] as const;
export type Platform = (typeof platforms)[number];
export const gameStatuses = ['Jugando', 'Pendiente', 'Completado', 'Abandonado'] as const;
export type GameStatus = (typeof gameStatuses)[number];

export interface Game {
  id: GameId;
  name: string;
  steamId: number;
  genre: string;
  description: string;
  developer: string;
  rating: number;
  duration: string;
  affinity: number;
  /** Each group represents platforms that may play together in this demo's matrix. */
  cooperativeGroups: Platform[][];
}

export interface CollectionEntry {
  gameId: GameId;
  platforms: Platform[];
  status: GameStatus;
  hours: number;
}

export interface Friend {
  id: string;
  name: string;
  tag: string;
  initials: string;
  color: 'amber' | 'violet' | 'blue' | 'coral';
  online: boolean;
  playing: GameId;
  platform: Platform;
  affinity: number;
  style: string;
  suggested?: boolean;
  library: { gameId: GameId; platforms: Platform[] }[];
}

export interface Offer {
  gameId: GameId;
  priceCents: number;
  originalCents: number;
  region: 'Europa';
  platform: Platform;
  seller: string;
}
