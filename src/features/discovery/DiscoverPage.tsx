import { useState } from 'react';
import { Network, Sparkles } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { GameCard } from '../../components/GameCard';
import { games } from '../../data/games';
import type { Game } from '../../domain/types';
import { AffinityExplanation } from './AffinityExplanation';

export default function DiscoverPage() {
  const [genre, setGenre] = useState('Todos');
  const [selected, setSelected] = useState<Game | null>(null);
  const result = games
    .filter((game) => genre === 'Todos' || game.genre === genre)
    .sort((a, b) => b.affinity - a.affinity);
  return (
    <>
      <PageHeader
        title="Tu próximo «solo una partida más»."
        description="Recomendaciones que conectan tus gustos, tus juegos y tu gente."
        actions={
          <Button onClick={() => setSelected(games[0] ?? null)}>
            <Network size={16} />
            Ver ejemplo de afinidad
          </Button>
        }
      />
      <div className="banner">
        <Sparkles />
        <div>
          <strong>Grandes mundos. Mejores historias.</strong>
          <p>Selección de ejemplo para explicar el motor de recomendaciones del proyecto.</p>
        </div>
        <span className="pill">Context Graphs</span>
      </div>
      <div className="tabs">
        {['Todos', 'RPG', 'Cooperativo', 'Roguelike', 'Puzles'].map((value) => (
          <button
            key={value}
            className={`tab ${genre === value ? 'active' : ''}`}
            aria-pressed={genre === value}
            onClick={() => setGenre(value)}
          >
            {value === 'Todos' ? 'Para ti' : value}
          </button>
        ))}
      </div>
      <div className="games-grid discover-grid">
        {result.map((game) => (
          <div key={game.id}>
            <GameCard game={game} affinity />
            <button className="recommendation-reason" onClick={() => setSelected(game)}>
              Por tus gustos y tu círculo · <span>¿Por qué?</span>
            </button>
          </div>
        ))}
      </div>
      <Dialog
        open={selected !== null}
        title="Los puntos que os conectan."
        onClose={() => setSelected(null)}
      >
        {selected && <AffinityExplanation game={selected} />}
      </Dialog>
    </>
  );
}
