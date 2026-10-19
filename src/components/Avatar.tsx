import type { Friend } from '../domain/types';

export function Avatar({
  friend,
  large = false,
}: {
  friend?: Pick<Friend, 'initials' | 'color' | 'online'>;
  large?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`avatar ${friend?.color ?? ''} ${friend?.online ? 'online' : ''} ${large ? 'large' : ''}`}
    >
      {friend?.initials ?? 'RG'}
    </span>
  );
}
