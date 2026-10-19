import type { Game, GameId } from '../domain/types';

export const games: Game[] = [
  {
    id: 'elden',
    name: 'Elden Ring',
    steamId: 1245620,
    genre: 'RPG',
    description:
      'Explora las Tierras Intermedias, descubre sus secretos y construye tu propio camino en este RPG de acción y mundo abierto.',
    developer: 'FromSoftware',
    rating: 96,
    duration: '60 h',
    affinity: 98,
    cooperativeGroups: [],
  },
  {
    id: 'baldurs',
    name: 'Baldur’s Gate 3',
    steamId: 1086940,
    genre: 'RPG',
    description:
      'Reúne a tu grupo y regresa a los Reinos Olvidados. Una aventura de decisiones, amistad y combates por turnos para jugar también en compañía.',
    developer: 'Larian Studios',
    rating: 96,
    duration: '75 h',
    affinity: 97,
    cooperativeGroups: [['Steam', 'Epic Games']],
  },
  {
    id: 'hades',
    name: 'Hades',
    steamId: 1145360,
    genre: 'Roguelike',
    description:
      'Desafía al dios de los muertos en un roguelike de acción. Cada intento de escapar del inframundo cuenta una nueva historia.',
    developer: 'Supergiant Games',
    rating: 93,
    duration: '23 h',
    affinity: 96,
    cooperativeGroups: [],
  },
  {
    id: 'hollow',
    name: 'Hollow Knight',
    steamId: 367520,
    genre: 'Metroidvania',
    description:
      'Desciende a un reino de insectos en ruinas. Explora cavernas, domina nuevas habilidades y descubre una historia dibujada a mano.',
    developer: 'Team Cherry',
    rating: 90,
    duration: '27 h',
    affinity: 94,
    cooperativeGroups: [],
  },
  {
    id: 'it-takes',
    name: 'It Takes Two',
    steamId: 1426210,
    genre: 'Cooperativo',
    description:
      'Una aventura diseñada para dos. Coopera con tu compañero, resuelve desafíos y viaja por un mundo donde cada nivel cambia las reglas.',
    developer: 'Hazelight Studios',
    rating: 89,
    duration: '14 h',
    affinity: 95,
    cooperativeGroups: [['Steam', 'Epic Games'], ['Xbox'], ['PlayStation']],
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    steamId: 1091500,
    genre: 'RPG',
    description:
      'Conviértete en un mercenario en Night City, una metrópolis obsesionada con el poder, el glamur y las modificaciones corporales.',
    developer: 'CD PROJEKT RED',
    rating: 86,
    duration: '25 h',
    affinity: 91,
    cooperativeGroups: [],
  },
  {
    id: 'stardew',
    name: 'Stardew Valley',
    steamId: 413150,
    genre: 'Simulación',
    description:
      'Empieza una nueva vida en el campo. Cultiva, pesca, conoce a tus vecinos y comparte tu granja con amigos.',
    developer: 'ConcernedApe',
    rating: 89,
    duration: '53 h',
    affinity: 93,
    cooperativeGroups: [['Steam'], ['Xbox']],
  },
  {
    id: 'deep-rock',
    name: 'Deep Rock Galactic',
    steamId: 548430,
    genre: 'Cooperativo',
    description:
      'Forma un equipo de enanos espaciales, excava cavernas y sobrevive a oleadas de enemigos en este shooter cooperativo.',
    developer: 'Ghost Ship Games',
    rating: 85,
    duration: 'Cooperativo',
    affinity: 92,
    cooperativeGroups: [['Steam'], ['Xbox']],
  },
  {
    id: 'portal',
    name: 'Portal 2',
    steamId: 620,
    genre: 'Puzles',
    description:
      'Resuelve puzles que desafían las leyes de la física. Su campaña cooperativa propone nuevas cámaras de pruebas para dos jugadores.',
    developer: 'Valve',
    rating: 95,
    duration: '9 h',
    affinity: 96,
    cooperativeGroups: [['Steam']],
  },
  {
    id: 'sea',
    name: 'Sea of Thieves',
    steamId: 1172620,
    genre: 'Cooperativo',
    description:
      'Reúne a tu tripulación, iza las velas y sal en busca de tesoros en una aventura pirata de mundo compartido.',
    developer: 'Rare',
    rating: 82,
    duration: 'Mundo abierto',
    affinity: 90,
    cooperativeGroups: [['Steam', 'Xbox', 'PlayStation']],
  },
];

export function getGame(id: GameId): Game {
  const game = games.find((game) => game.id === id);
  if (!game) throw new Error('Juego desconocido: ' + id);
  return game;
}
