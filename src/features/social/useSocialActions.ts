import { useApp } from '../../app/AppContext';
import type { GameId } from '../../domain/types';

export function useSocialActions() {
  const { dispatch, notify } = useApp();
  function invite(friendIds: string[], gameId: GameId | null = null) {
    friendIds.forEach((friendId) =>
      dispatch({ type: 'social/invite', id: crypto.randomUUID(), friendId, gameId }),
    );
    notify('Invitación guardada en la demo. No se ha enviado un mensaje real.');
  }
  return { invite };
}
