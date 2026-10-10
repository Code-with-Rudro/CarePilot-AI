import React from 'react';
import { Filter } from 'lucide-react';

interface DiagnosticFilterProps {
  categories: string[];
  selected: string[];
  onToggle: (cat: string) => void;
}

export const DiagnosticFilter: React.FC<DiagnosticFilterProps> = ({ categories, selected, onToggle }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Filter size={14} color="var(--color-text-muted)" />
      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginRight: '0.25rem' }}>Filter:</span>
      {categories.map(cat => {
        const isActive = selected.includes(cat);
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            style={{
              padding: '0.25rem 0.75rem', fontSize: '0.8125rem', fontFamily: 'inherit',
              borderRadius: 'var(--radius-full)', cursor: 'pointer', border: '1px solid',
              borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
              background: isActive ? 'var(--color-primary-light)' : 'transparent',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: isActive ? 600 : 400, transition: 'all var(--transition-fast)',
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};
