import { useState } from 'react';
import { Check, MessageSquare, Plus, Search, Users } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { PageHeader } from '../../components/PageHeader';
import { Dialog } from '../../components/Dialog';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { friends } from '../../data/friends';
import { getGame } from '../../data/games';
import { activeFriends } from '../../domain/social';
import type { Friend } from '../../domain/types';
import { useSocialActions } from './useSocialActions';
import { FriendFinder } from './FriendFinder';
import { ChatPanel } from './ChatPanel';

export default function FriendsPage() {
  const { state, dispatch, notify } = useApp();
  const { invite } = useSocialActions();
  const [tab, setTab] = useState<'friends' | 'suggested'>('friends');
  const [query, setQuery] = useState('');
  const [finder, setFinder] = useState(false);
  const [chat, setChat] = useState<Friend | null>(null);
  const list =
    tab === 'friends'
      ? activeFriends(state)
      : friends.filter((friend) => friend.suggested && !state.addedFriends.includes(friend.id));
  const result = list.filter((friend) =>
    `${friend.name} ${friend.tag}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="La mejor parte es compartirla."
        description="Tu círculo de juego, más allá de las plataformas."
        actions={
          <Button variant="primary" onClick={() => setFinder(true)}>
            <Users size={16} />
            ¿A qué jugamos?
          </Button>
        }
      />
      <div className="tabs">
        {(['friends', 'suggested'] as const).map((value) => (
          <button
            key={value}
            aria-pressed={tab === value}
            className={`tab ${tab === value ? 'active' : ''}`}
            onClick={() => {
              setTab(value);
              setQuery('');
            }}
          >
            {value === 'friends' ? 'Mis amigos' : 'Jugadores afines'}
          </button>
        ))}
      </div>
      <div className="toolbar">
        <label className="search-input">
          <Search size={17} />
          <input
            aria-label="Buscar jugadores"
            placeholder="Buscar por nombre o HubTag…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <span className="muted">Horario de ejemplo: 20:00–23:00</span>
      </div>
      <div className="friends-grid">
        {result.map((friend) => {
          const suggested = friend.suggested && !state.addedFriends.includes(friend.id);
          const invited = state.invitations.some((invitation) => invitation.friendId === friend.id);
          return (
            <article className="panel person-card" key={friend.id}>
              <div className="person-header">
                <Avatar friend={friend} large />
                <div>
                  <h3>{friend.name}</h3>
                  <small>{friend.tag}</small>
                </div>
              </div>
              <p className="muted">
                {friend.online
                  ? `En ${getGame(friend.playing).name}`
                  : 'Última conexión: hace 1 hora'}
                <br />
                {friend.style}
              </p>
              <div className="affinity-label">
                <span>Afinidad de ejemplo</span>
                <strong>{friend.affinity}%</strong>
              </div>
              <progress
                value={friend.affinity}
                max={100}
                aria-label={`Afinidad con ${friend.name}`}
              />
              <div className="tag-row">
                <span>{friend.platform}</span>
                <span>20:00–23:00</span>
                <span>
                  {
                    friend.library.filter((entry) =>
                      state.collection.some((own) => own.gameId === entry.gameId),
                    ).length
                  }{' '}
                  juegos en común
                </span>
              </div>
              <div className="button-row">
                {suggested ? (
                  <Button
                    size="small"
                    variant="primary"
                    onClick={() => {
                      dispatch({ type: 'friends/add', friendId: friend.id });
                      notify('Amistad añadida en esta demo.');
                    }}
                  >
                    <Plus size={15} />
                    Añadir amigo
                  </Button>
                ) : (
                  <Button size="small" onClick={() => invite([friend.id])}>
                    {invited ? <Check size={15} /> : <Plus size={15} />}
                    {invited ? 'Invitado' : 'Invitar'}
                  </Button>
                )}
                <Button size="small" variant="ghost" onClick={() => setChat(friend)}>
                  <MessageSquare size={15} />
                  Chat
                </Button>
              </div>
            </article>
          );
        })}
        {result.length === 0 && (
          <EmptyState
            title="Nadie por aquí todavía."
            description="Prueba otro nombre o consulta tus amigos."
          />
        )}
      </div>
      <Dialog open={finder} title="¿A qué jugamos juntos?" onClose={() => setFinder(false)}>
        <FriendFinder />
      </Dialog>
      <Dialog
        open={chat !== null}
        title={`Chat con ${chat?.name ?? ''}`}
        onClose={() => setChat(null)}
      >
        {chat && <ChatPanel key={chat.id} friend={chat} />}
      </Dialog>
    </>
  );
}
