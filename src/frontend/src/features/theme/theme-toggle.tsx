import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme, ThemePreference } from './theme-context';

interface ThemeToggleProps {
  variant?: 'compact' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'compact' }) => {
  const { preference, resolvedTheme, setThemePreference } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'segmented') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          padding: '0.25rem',
          gap: '0.25rem',
        }}
      >
        <button
          type="button"
          onClick={() => setThemePreference('light')}
          title="Light Mode"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: preference === 'light' ? 600 : 500,
            backgroundColor: preference === 'light' ? 'var(--color-surface)' : 'transparent',
            color: preference === 'light' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            boxShadow: preference === 'light' ? 'var(--shadow-sm)' : 'none',
            border: preference === 'light' ? '1px solid var(--color-border)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Sun size={14} />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setThemePreference('dark')}
          title="Dark Mode"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: preference === 'dark' ? 600 : 500,
            backgroundColor: preference === 'dark' ? 'var(--color-surface)' : 'transparent',
            color: preference === 'dark' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            boxShadow: preference === 'dark' ? 'var(--shadow-sm)' : 'none',
            border: preference === 'dark' ? '1px solid var(--color-border)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Moon size={14} />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setThemePreference('system')}
          title="System Default"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: preference === 'system' ? 600 : 500,
            backgroundColor: preference === 'system' ? 'var(--color-surface)' : 'transparent',
            color: preference === 'system' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            boxShadow: preference === 'system' ? 'var(--shadow-sm)' : 'none',
            border: preference === 'system' ? '1px solid var(--color-border)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Laptop size={14} />
          <span>System</span>
        </button>
      </div>
    );
  }

  // Compact variant for Header navigation bar
  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        id="theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={`Theme: ${preference} (${resolvedTheme}). Click to change.`}
        aria-label="Toggle theme mode"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-main)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
          e.currentTarget.style.borderColor = 'var(--color-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-surface)';
          e.currentTarget.style.borderColor = 'var(--color-border)';
        }}
      >
        {resolvedTheme === 'dark' ? (
          <Moon size={18} color="var(--color-primary)" />
        ) : (
          <Sun size={18} color="var(--color-primary)" />
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-dropdown)',
            padding: '0.375rem',
            minWidth: '160px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            animation: 'fadeIn var(--transition-fast) ease-out',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setThemePreference('light');
              setIsOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: preference === 'light' ? 600 : 500,
              backgroundColor: preference === 'light' ? 'var(--color-accent)' : 'transparent',
              color: preference === 'light' ? 'var(--color-primary-dark)' : 'var(--color-text-main)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background-color var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Sun size={16} />
              <span>Light Mode</span>
            </div>
            {preference === 'light' && <Check size={14} />}
          </button>

          <button
            type="button"
            onClick={() => {
              setThemePreference('dark');
              setIsOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: preference === 'dark' ? 600 : 500,
              backgroundColor: preference === 'dark' ? 'var(--color-accent)' : 'transparent',
              color: preference === 'dark' ? 'var(--color-primary-dark)' : 'var(--color-text-main)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background-color var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Moon size={16} />
              <span>Dark Mode</span>
            </div>
            {preference === 'dark' && <Check size={14} />}
          </button>

          <button
            type="button"
            onClick={() => {
              setThemePreference('system');
              setIsOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: preference === 'system' ? 600 : 500,
              backgroundColor: preference === 'system' ? 'var(--color-accent)' : 'transparent',
              color: preference === 'system' ? 'var(--color-primary-dark)' : 'var(--color-text-main)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background-color var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Laptop size={16} />
              <span>System Default</span>
            </div>
            {preference === 'system' && <Check size={14} />}
          </button>
        </div>
      )}
    </div>
  );
};
