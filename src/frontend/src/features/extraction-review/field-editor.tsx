import React from 'react';

interface FieldEditorProps {
  value: string;
  onChange: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({ value, onChange, onSave, onCancel, placeholder }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? 'Enter corrected value…'}
        autoFocus
        style={{
          width: '100%', padding: '0.5rem 0.75rem',
          border: '1.5px solid var(--color-primary)', borderRadius: 'var(--radius-sm)',
          fontSize: '0.9rem', color: 'var(--color-text-main)', background: 'var(--color-surface)',
          outline: 'none',
        }}
        onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel(); }}
      />
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '0.35rem 0.875rem', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8125rem',
            fontFamily: 'inherit', background: 'transparent', color: 'var(--color-text-secondary)',
          }}
        >Cancel</button>
        <button
          onClick={onSave}
          style={{
            padding: '0.35rem 0.875rem', background: 'var(--color-primary)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'inherit',
          }}
        >Save</button>
      </div>
    </div>
  );
};
