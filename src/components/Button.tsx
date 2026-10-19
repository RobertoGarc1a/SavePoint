import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'normal';
}
export function Button({
  variant = 'secondary',
  size = 'normal',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`button ${variant} ${size === 'small' ? 'small' : ''} ${className}`}
      {...props}
    />
  );
}
