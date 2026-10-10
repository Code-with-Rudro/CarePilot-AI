import React from 'react';
import { User } from '../../types/user';

interface ProfileSelectorProps {
  users: User[];
  currentUser: User;
  onSelect: (user: User) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ users, currentUser, onSelect }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {users.map(user => (
        <button
          key={user.id}
          onClick={() => onSelect(user)}
          style={{
            padding: '0.5rem 0.75rem',
            background: user.id === currentUser.id ? 'var(--color-primary-light)' : 'transparent',
            border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            textAlign: 'left', fontFamily: 'inherit', fontSize: '0.875rem',
            color: user.id === currentUser.id ? 'var(--color-primary)' : 'var(--color-text-main)',
            fontWeight: user.id === currentUser.id ? 600 : 400,
          }}
        >
          {user.name} — {user.role}
        </button>
      ))}
    </div>
  );
};

export default ProfileSelector;
