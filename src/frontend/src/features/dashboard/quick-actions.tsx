import React from 'react';
import { Upload, MessageSquare, FileText, Bell } from 'lucide-react';

interface QuickActionsProps {
  onUpload: () => void;
  onAskCopilot: () => void;
  onViewRecords: () => void;
  onReminders: () => void;
}

const actions = [
  { id: 'upload', label: 'Upload Record', icon: Upload, color: 'var(--color-primary)' },
  { id: 'copilot', label: 'Ask Copilot', icon: MessageSquare, color: '#245DA8' },
  { id: 'records', label: 'My Records', icon: FileText, color: 'var(--color-success)' },
  { id: 'reminders', label: 'Reminders', icon: Bell, color: 'var(--color-attention)' },
];

export const QuickActions: React.FC<QuickActionsProps> = ({ onUpload, onAskCopilot, onViewRecords, onReminders }) => {
  const handlers: Record<string, () => void> = {
    upload: onUpload, copilot: onAskCopilot, records: onViewRecords, reminders: onReminders,
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
      {actions.map(({ id, label, icon: Icon, color }) => (
        <button
          key={id}
          onClick={handlers[id]}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            padding: '1.25rem 0.75rem', background: 'var(--color-surface)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
            cursor: 'pointer', transition: 'box-shadow var(--transition-fast), transform var(--transition-fast)',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color={color} />
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-main)', textAlign: 'center' }}>{label}</span>
        </button>
      ))}
    </div>
  );
};
