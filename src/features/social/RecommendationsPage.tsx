import { useApp } from '../../app/AppContext';
import { receivedRecommendations, friends } from '../../data/friends';
import { getGame } from '../../data/games';
import { PageHeader } from '../../components/PageHeader';
import { GameCover } from '../../components/GameCover';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';

export default function RecommendationsPage() {
  const { state, dispatch, notify } = useApp();
  const pending = receivedRecommendations.filter(
    (recommendation) => !state.recommendationDecisions[recommendation.id],
  );
  return (
    <>
      <PageHeader
        title="Las buenas recomendaciones tienen nombre."
        description="Tu buzón de juegos recomendados por amigos, con un motivo para cada aventura."
      />
      <section className="panel">
        {pending.map((recommendation) => (
          <article className="inbox-item" key={recommendation.id}>
            <GameCover game={getGame(recommendation.gameId)} />
            <div>
              <small className="muted">
                {friends.find((friend) => friend.id === recommendation.friendId)?.name} te
                recomienda
              </small>
              <h2>{getGame(recommendation.gameId).name}</h2>
              <blockquote>«{recommendation.note}»</blockquote>
              <div className="button-row">
                {(
                  [
                    ['accepted', 'Guardar en deseos'],
                    ['played', 'Ya lo jugué'],
                    ['ignored', 'Ignorar'],
                  ] as const
                ).map(([decision, label]) => (
                  <Button
                    key={decision}
                    size="small"
                    variant={decision === 'accepted' ? 'primary' : 'ghost'}
                    onClick={() => {
                      dispatch({ type: 'recommendations/decide', id: recommendation.id, decision });
                      notify(
                        decision === 'accepted'
                          ? 'Juego guardado. Recomendación aceptada.'
                          : 'Recomendación actualizada.',
                      );
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </article>
        ))}
        {pending.length === 0 && (
          <EmptyState
            title="Todo al día."
            description="Tus próximas recomendaciones de amigos aparecerán aquí."
          />
        )}
        <p className="fine-print">
          Reputación demo de tu círculo:{' '}
          {Object.values(state.recommendationDecisions).filter(
            (decision) => decision === 'accepted',
          ).length * 10}{' '}
          puntos por recomendaciones aceptadas.
        </p>
      </section>
    </>
  );
}
