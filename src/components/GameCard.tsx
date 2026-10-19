import { Heart, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../app/AppContext';
import { activeFriends } from '../domain/social';
import { gameStatuses, type CollectionEntry, type Game } from '../domain/types';
import { GameCover } from './GameCover';

export function GameCard({
  game,
  entry,
  affinity = false,
}: {
  game: Game;
  entry?: CollectionEntry;
  affinity?: boolean;
}) {
  const { state, dispatch, notify } = useApp();
  const wished = state.wishlist.includes(game.id);
  const friends = activeFriends(state).filter((friend) =>
    friend.library.some((item) => item.gameId === game.id),
  );
  return (
    <article className="game-card">
      <div className="card-art">
        <Link to={`/games/${game.id}`}>
          <GameCover game={game} />
        </Link>
        <span className="card-score">
          {affinity ? (
            `${game.affinity}% para ti`
          ) : (
            <>
              <Star size={11} /> {game.rating}
            </>
          )}
        </span>
        <button
          className={`save-button ${wished ? 'saved' : ''}`}
          aria-label={`${wished ? 'Quitar de' : 'Añadir a'} deseos: ${game.name}`}
          aria-pressed={wished}
          onClick={() => {
            dispatch({ type: 'wishlist/toggle', gameId: game.id });
            notify(wished ? 'Juego eliminado de deseos.' : 'Guardado en tu lista de deseos.');
          }}
        >
          <Heart size={16} />
        </button>
      </div>
      <div className="game-card-body">
        <Link className="game-title" to={`/games/${game.id}`}>
          {game.name}
        </Link>
        <div className="game-meta">
          <span>{game.genre}</span>
          <div className="platform-badges">
            {entry?.platforms.map((platform) => (
              <span key={platform} title={platform}>
                {platform === 'PlayStation' ? 'PS' : platform === 'Epic Games' ? 'Epic' : platform}
              </span>
            ))}
          </div>
        </div>
        <div className="game-card-footer">
          {entry ? (
            <>
              <span>{entry.hours} h jugadas</span>
              <select
                aria-label={`Estado de ${game.name}`}
                value={entry.status}
                onChange={(event) => {
                  const status = gameStatuses.find((value) => value === event.target.value);
                  if (status) dispatch({ type: 'library/status', gameId: game.id, status });
                }}
              >
                {gameStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </>
          ) : (
            <>
              <span>
                <Users size={13} /> {friends.length} amigos lo tienen
              </span>
              <Link to={`/games/${game.id}`} className="lime">
                Descubrir
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
