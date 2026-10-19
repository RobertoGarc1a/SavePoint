import { Network } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import type { Game } from '../../domain/types';
import { activeFriends } from '../../domain/social';

export function AffinityExplanation({ game }: { game: Game }) {
  const { state } = useApp();
  const count = activeFriends(state).filter((friend) =>
    friend.library.some((entry) => entry.gameId === game.id),
  ).length;
  return (
    <>
      <span className="pill">
        <Network size={14} />
        CONTEXT GRAPHS · MODELO ILUSTRATIVO
      </span>
      <h3>
        {game.name} · {game.affinity}% de afinidad demo
      </h3>
      <p>
        {state.preferences.personalization
          ? 'La propuesta combina gustos, juegos compartidos y horarios para hacer recomendaciones explicables.'
          : 'La personalización está desactivada. Esta vista muestra únicamente un ejemplo estático del proyecto.'}
      </p>
      <svg
        className="affinity-graph"
        viewBox="0 0 480 230"
        role="img"
        aria-label="Grafo ilustrativo que conecta a Roberto, sus géneros favoritos, un videojuego y sus amigos"
      >
        <g stroke="#628744" fill="none">
          <path d="M80 115 230 45 390 115 230 185 80 115H390M230 45v140" />
        </g>
        <g fill="#293b20" stroke="#a6cb6b">
          <circle cx="80" cy="115" r="35" />
          <circle cx="230" cy="45" r="33" />
          <circle cx="390" cy="115" r="40" />
          <circle cx="230" cy="185" r="32" />
        </g>
        <g textAnchor="middle" fill="#d9e6ca">
          <text x="80" y="119">
            Roberto
          </text>
          <text x="230" y="49">
            {game.genre}
          </text>
          <text x="390" y="113">
            Tu próximo
          </text>
          <text x="390" y="129">
            juego
          </text>
          <text x="230" y="189">
            Amigos
          </text>
        </g>
      </svg>
      <div className="facts">
        <div>
          <small>INTERESES</small>
          <strong>{game.genre}</strong>
        </div>
        <div>
          <small>CONTEXTO SOCIAL</small>
          <strong>{count} amigos</strong>
        </div>
        <div>
          <small>FRANJA DEMO</small>
          <strong>20:00–23:00</strong>
        </div>
      </div>
      <p className="notice">
        Los porcentajes y el grafo son ejemplos estáticos. No hay un motor de IA ejecutándose ni se
        analizan datos reales.
      </p>
    </>
  );
}
