import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Network, Heart, MessageSquare, Bot } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { games } from '../../data/games';
import { GameCover } from '../../components/GameCover';
import { Dialog } from '../../components/Dialog';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { RecommendationForm } from '../social/RecommendationForm';
import { AffinityExplanation } from '../discovery/AffinityExplanation';

export default function GameDetailPage() {
  const { gameId } = useParams();
  const game = games.find((candidate) => candidate.id === gameId);
  const { state, dispatch } = useApp();
  const [dialog, setDialog] = useState<'recommend' | 'affinity' | null>(null);
  if (!game)
    return (
      <EmptyState
        title="No encontramos esta aventura."
        description="Ese juego no está en el catálogo de demostración."
        action={
          <Link className="button" to="/library">
            Volver a la biblioteca
          </Link>
        }
      />
    );
  const entry = state.collection.find((item) => item.gameId === game.id);
  const wished = state.wishlist.includes(game.id);
  return (
    <>
      <Link to="/library" className="text-link back-link">
        <ArrowLeft size={16} />
        Volver a la biblioteca
      </Link>
      <div className="game-detail">
        <GameCover game={game} className="detail-art" eager />
        <div className="panel detail-copy">
          <p className="eyebrow">
            {game.developer} · {game.genre}
          </p>
          <h1>{game.name}</h1>
          <p>{game.description}</p>
          <div className="facts">
            <div>
              <small>VALORACIÓN</small>
              <strong>{game.rating}/100</strong>
            </div>
            <div>
              <small>DURACIÓN APROX.</small>
              <strong>{game.duration}</strong>
            </div>
            <div>
              <small>TU ESTADO</small>
              <strong>{entry?.status ?? 'Por descubrir'}</strong>
            </div>
          </div>
          {entry && (
            <div className="platform-badges">
              {entry.platforms.map((platform) => (
                <span key={platform}>{platform}</span>
              ))}
            </div>
          )}
          <div className="button-row">
            <Button
              variant="primary"
              onClick={() => dispatch({ type: 'wishlist/toggle', gameId: game.id })}
            >
              <Heart size={16} />
              {wished ? 'Quitar de deseos' : 'Guardar en deseos'}
            </Button>
            <Button onClick={() => setDialog('recommend')}>
              <MessageSquare size={16} />
              Recomendar
            </Button>
            <Button variant="ghost" onClick={() => setDialog('affinity')}>
              <Network size={16} />
              ¿Por qué para mí?
            </Button>
            {!entry && (
              <Link className="button ghost" to={`/marketplace?game=${game.id}`}>
                <Bot size={16} />
                Crear agente
              </Link>
            )}
          </div>
          <p className="notice">
            Ficha y actividad de demostración. No se consultan cuentas ni APIs externas.
          </p>
        </div>
      </div>
      <Dialog
        open={dialog !== null}
        title={
          dialog === 'recommend' ? 'Este juego tiene su nombre.' : 'Los puntos que os conectan.'
        }
        onClose={() => setDialog(null)}
      >
        {dialog === 'recommend' ? (
          <RecommendationForm gameId={game.id} onSent={() => setDialog(null)} />
        ) : (
          <AffinityExplanation game={game} />
        )}
      </Dialog>
    </>
  );
}
