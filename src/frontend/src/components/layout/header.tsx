import React from 'react';
import { Menu, Upload, User as UserIcon, Shield, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/use-auth';

interface HeaderProps {
  pageTitle: string;
  onOpenUpload: () => void;
  onToggleMobileMenu?: () => void;
  onLaunchAR?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  onOpenUpload,
  onToggleMobileMenu,
  onLaunchAR,
}) => {
  const { currentUser, loginAs, availableUsers } = useAuth();

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleMobileMenu}
          aria-label="Open navigation menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-main)',
          }}
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
            {pageTitle}
          </h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Fast AR Launcher button */}
        {onLaunchAR && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onLaunchAR}
            leftIcon={<Sparkles size={16} />}
          >
            AR Medicine Scan
          </Button>
        )}

        {/* Upload Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenUpload}
          leftIcon={<Upload size={16} />}
        >
          Upload Record
        </Button>

        {/* User Identity / Persona Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--color-border)' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-primary-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.8125rem',
            }}
          >
            <UserIcon size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = availableUsers.find(user => user.id === e.target.value);
                if (u) loginAs(u);
              }}
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {availableUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            {currentUser.abhaId && (
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Shield size={10} /> ABHA: {currentUser.abhaId.slice(-4)}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
