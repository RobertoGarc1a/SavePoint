import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../app/AppContext';
import { getGame } from '../../data/games';
import type { Friend } from '../../domain/types';
import { Button } from '../../components/Button';

export function ChatPanel({ friend }: { friend: Friend }) {
  const { state, dispatch } = useApp();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const messages = state.messages.filter((message) => message.friendId === friend.id);
  const invitations = state.invitations.filter((invite) => invite.friendId === friend.id);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, invitations.length]);
  return (
    <>
      <p>Conversación local de demostración. No se envían mensajes reales.</p>
      <div
        className="chat-messages"
        ref={scrollRef}
        role="log"
        aria-label={`Conversación con ${friend.name}`}
      >
        <p className="chat-message">
          <small>{friend.name} · Mensaje de ejemplo</small>¡Buenas! ¿Nos echamos una partida esta
          noche?
        </p>
        {invitations.map((invitation) => (
          <p className="chat-invite" key={invitation.id}>
            Invitación guardada:{' '}
            {invitation.gameId ? getGame(invitation.gameId).name : 'una partida esta noche'}
          </p>
        ))}
        {messages.map((message) => (
          <p className="chat-message mine" key={message.id}>
            <small>Tú · Guardado en la demo</small>
            {message.text}
          </p>
        ))}
      </div>
      <form
        className="chat-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!text.trim()) return;
          dispatch({
            type: 'social/message',
            id: crypto.randomUUID(),
            friendId: friend.id,
            text,
            now: new Date().toISOString(),
          });
          setText('');
        }}
      >
        <input
          aria-label={`Mensaje para ${friend.name}`}
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={500}
          required
          placeholder="Escribe un mensaje…"
        />
        <Button type="submit" variant="primary" disabled={!text.trim()}>
          Guardar
        </Button>
      </form>
    </>
  );
}
