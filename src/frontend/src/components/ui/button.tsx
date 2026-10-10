import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          border: '1px solid var(--color-primary)',
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-primary-dark)',
          border: '1px solid rgba(23, 107, 102, 0.2)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-text-main)',
          border: '1px solid var(--color-border)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-text-secondary)',
          border: '1px solid transparent',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--color-critical-bg)',
          color: 'var(--color-critical)',
          border: '1px solid rgba(180, 35, 24, 0.2)',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { padding: '0.375rem 0.75rem', fontSize: '0.8125rem' };
      case 'lg':
        return { padding: '0.75rem 1.5rem', fontSize: '1rem' };
      default:
        return { padding: '0.5rem 1.125rem', fontSize: '0.875rem' };
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: 500,
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition-fast)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    whiteSpace: 'nowrap',
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style,
  };

  return (
    <button
      style={baseStyle}
      disabled={disabled || isLoading}
      className={className}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: '1em',
            height: '1em',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.75s linear infinite',
          }}
        />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
