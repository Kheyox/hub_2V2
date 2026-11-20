import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-bg font-semibold hover:brightness-110 active:scale-[0.98]',
  secondary: 'bg-surface-2 text-ink border border-border hover:bg-surface active:scale-[0.98]',
  ghost: 'bg-transparent text-muted hover:text-ink hover:bg-surface-2/60 active:scale-[0.98]',
  danger: 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 active:scale-[0.98]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-btn',
  md: 'px-4 py-2.5 text-sm rounded-btn',
  lg: 'px-5 py-3.5 text-base rounded-btn',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ elevated = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-card border border-border p-4 ${elevated ? 'bg-surface-2' : 'bg-surface'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-muted border border-border ${className}`}
    >
      {children}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-card bg-surface border border-border p-5 shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-btn px-2.5 py-1 text-sm text-muted hover:text-ink hover:bg-surface-2"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PlayerPill({
  name,
  avatar,
  color,
  active = false,
}: {
  name: string;
  avatar: string;
  color: string;
  active?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
        active ? 'bg-surface-2 scale-105 shadow-md' : 'bg-surface opacity-80'
      }`}
      style={{ borderColor: active ? color : 'var(--border)' }}
    >
      <span>{avatar}</span>
      <span className="truncate max-w-[90px]">{name}</span>
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    </div>
  );
}
