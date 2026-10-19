import { useState } from 'react';
import { useApp } from '../../app/AppContext';
import { activeFriends, sharedCooperativeGames } from '../../domain/social';
import { Avatar } from '../../components/Avatar';
import { GameCover } from '../../components/GameCover';
import { Button } from '../../components/Button';
import { useSocialActions } from './useSocialActions';

export function FriendFinder() {
  const { state } = useApp();
  const { invite } = useSocialActions();
  const [selected, setSelected] = useState<string[]>(['jaime']);
  const result = sharedCooperativeGames(state, selected);
  return (
    <>
      <p>
        Selecciona a tu grupo. Buscaremos juegos cooperativos que todos tengáis en plataformas
        compatibles.
      </p>
      <fieldset className="friend-selector">
        <legend>Tu grupo</legend>
        {activeFriends(state).map((friend) => (
          <label className="check-option" key={friend.id}>
            <input
              type="checkbox"
              checked={selected.includes(friend.id)}
              onChange={(event) =>
                setSelected(
                  event.target.checked
                    ? [...selected, friend.id]
                    : selected.filter((id) => id !== friend.id),
                )
              }
            />
            <Avatar friend={friend} />
            <span>{friend.name}</span>
            <small>{friend.platform}</small>
          </label>
        ))}
      </fieldset>
      <h3>Vuestra próxima partida</h3>
      <div aria-live="polite">
        {result.map((game) => (
          <div className="shared-result" key={game.id}>
            <GameCover game={game} />
            <div>
              <strong>{game.name}</strong>
              <small>En todas vuestras bibliotecas · Compatible</small>
            </div>
            <Button size="small" variant="primary" onClick={() => invite(selected, game.id)}>
              Invitar
            </Button>
          </div>
        ))}
        {result.length === 0 && (
          <p className="notice">
            {selected.length
              ? 'No hay juegos cooperativos compatibles para este grupo. Prueba seleccionando solo a Jaime.'
              : 'Selecciona al menos un amigo.'}
          </p>
        )}
      </div>
      <p className="fine-print">
        Compatibilidad basada en una matriz de ejemplo, sin comprobaciones de ediciones o consolas
        reales.
      </p>
    </>
  );
}
