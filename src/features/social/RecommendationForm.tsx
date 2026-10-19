import { useState } from 'react';
import { useApp } from '../../app/AppContext';
import { activeFriends } from '../../domain/social';
import { getGame } from '../../data/games';
import type { GameId } from '../../domain/types';
import { Button } from '../../components/Button';

export function RecommendationForm({ gameId, onSent }: { gameId: GameId; onSent: () => void }) {
  const { state, dispatch, notify } = useApp();
  const friends = activeFriends(state);
  const [friendId, setFriendId] = useState(friends[0]?.id ?? '');
  const [note, setNote] = useState('');
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!note.trim() || !friendId) return;
        dispatch({
          type: 'social/message',
          id: crypto.randomUUID(),
          friendId,
          text: `Te recomiendo ${getGame(gameId).name}: ${note.trim()}`,
          now: new Date().toISOString(),
        });
        notify('Recomendación guardada en el chat local de la demo.');
        onSent();
      }}
    >
      <p>Una buena recomendación empieza con alguien que te conoce.</p>
      <label className="field">
        Para
        <select value={friendId} onChange={(event) => setFriendId(event.target.value)}>
          {friends.map((friend) => (
            <option key={friend.id} value={friend.id}>
              {friend.name} · {friend.tag}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Tu recomendación
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={240}
          required
          placeholder="Creo que te va a encantar porque…"
        />
        <small>{note.length}/240 caracteres · Solo se guarda en este navegador.</small>
      </label>
      <Button type="submit" variant="primary" disabled={!note.trim()}>
        Guardar recomendación demo
      </Button>
    </form>
  );
}
