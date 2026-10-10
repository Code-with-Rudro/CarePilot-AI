import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'attention' | 'critical' | 'info' | 'default';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  style,
  ...props
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'var(--color-success-bg)',
          text: 'var(--color-success)',
          border: 'rgba(36, 122, 75, 0.2)',
        };
      case 'attention':
        return {
          bg: 'var(--color-attention-bg)',
          text: 'var(--color-attention)',
          border: 'rgba(148, 98, 0, 0.2)',
        };
      case 'critical':
        return {
          bg: 'var(--color-critical-bg)',
          text: 'var(--color-critical)',
          border: 'rgba(180, 35, 24, 0.2)',
        };
      case 'info':
        return {
          bg: 'var(--color-info-bg)',
          text: 'var(--color-info)',
          border: 'rgba(36, 93, 168, 0.2)',
        };
      default:
        return {
          bg: 'var(--color-bg)',
          text: 'var(--color-text-secondary)',
          border: 'var(--color-border)',
        };
    }
  };

  const colors = getColors();

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontWeight: 500,
    borderRadius: 'var(--radius-full)',
    backgroundColor: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    padding: size === 'sm' ? '0.125rem 0.5rem' : '0.25rem 0.625rem',
    fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
    lineHeight: 1.2,
    letterSpacing: '0.01em',
    ...style,
  };

  return (
    <span style={badgeStyle} {...props}>
      {children}
    </span>
  );
};
