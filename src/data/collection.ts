import type { CollectionEntry } from '../domain/types';

export const initialCollection: CollectionEntry[] = [
  {
    gameId: 'elden',
    platforms: ['Steam', 'PlayStation'],
    status: 'Jugando',
    hours: 86,
  },
  {
    gameId: 'baldurs',
    platforms: ['Steam'],
    status: 'Jugando',
    hours: 42,
  },
  {
    gameId: 'hades',
    platforms: ['Steam', 'Epic Games'],
    status: 'Pendiente',
    hours: 31,
  },
  {
    gameId: 'hollow',
    platforms: ['Steam'],
    status: 'Completado',
    hours: 47,
  },
  {
    gameId: 'it-takes',
    platforms: ['Steam', 'Xbox'],
    status: 'Pendiente',
    hours: 4,
  },
  {
    gameId: 'cyberpunk',
    platforms: ['Epic Games'],
    status: 'Completado',
    hours: 63,
  },
  {
    gameId: 'stardew',
    platforms: ['Steam', 'Xbox'],
    status: 'Jugando',
    hours: 25,
  },
  {
    gameId: 'deep-rock',
    platforms: ['Steam', 'Xbox'],
    status: 'Abandonado',
    hours: 12,
  },
];
