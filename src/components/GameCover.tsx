import { useState } from 'react';
import type { Game } from '../domain/types';

export function GameCover({
  game,
  className = '',
  eager = false,
}: {
  game: Game;
  className?: string;
  eager?: boolean;
}) {
  const [fallback, setFallback] = useState(false);
  return (
    <div className={`game-cover ${className}`}>
      <img
        src={
          fallback
            ? `/assets/${game.id}.svg`
            : `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.steamId}/header.jpg`
        }
        alt={`Portada de ${game.name}`}
        loading={eager ? 'eager' : 'lazy'}
        onError={() => setFallback(true)}
      />
      {fallback && (
        <span className="cover-title" aria-hidden="true">
          {game.name}
        </span>
      )}
    </div>
  );
}
