import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  id,
  style,
  disabled,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--color-text-main)',
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: disabled ? 'var(--color-bg)' : 'var(--color-surface)',
          border: `1px solid ${error ? 'var(--color-critical)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0 0.75rem',
          transition: 'border-color var(--transition-fast)',
        }}
      >
        {leftIcon && (
          <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', marginRight: '0.5rem' }}>
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '0.625rem 0',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--color-text-main)',
            fontSize: '0.875rem',
            ...style,
          }}
          {...props}
        />
        {rightIcon && (
          <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-critical)' }}>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};
