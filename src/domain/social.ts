import { friends } from '../data/friends';
import { games } from '../data/games';
import { visibleCollection } from './library';
import type { AppState } from './state';

export const activeFriends = (state: AppState) =>
  friends.filter((friend) => !friend.suggested || state.addedFriends.includes(friend.id));

export function sharedCooperativeGames(state: AppState, friendIds: string[]) {
  if (!friendIds.length) return [];
  const selected = activeFriends(state).filter((friend) => friendIds.includes(friend.id));
  if (selected.length !== new Set(friendIds).size) return [];
  return games.filter((game) => {
    const ownEntry = visibleCollection(state).find((entry) => entry.gameId === game.id);
    if (!ownEntry) return false;
    const libraries = [
      ownEntry.platforms.filter((platform) => state.connectedPlatforms.includes(platform)),
      ...selected.map(
        (friend) => friend.library.find((entry) => entry.gameId === game.id)?.platforms ?? [],
      ),
    ];
    return game.cooperativeGroups.some((group) =>
      libraries.every((libraryPlatforms) =>
        libraryPlatforms.some((platform) => group.includes(platform)),
      ),
    );
  });
}
