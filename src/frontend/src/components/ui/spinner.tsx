import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'var(--color-primary)',
  label,
}) => {
  const getDimension = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 32;
      default: return 24;
    }
  };

  const dim = getDimension();

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem' }}>
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: 'spin 0.8s linear infinite' }}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      {label && (
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {label}
        </span>
      )}
    </div>
  );
};
