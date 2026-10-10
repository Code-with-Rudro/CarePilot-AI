import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps {
  type?: 'info' | 'success' | 'attention' | 'critical';
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  action,
}) => {
  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--color-success-bg)',
          border: 'rgba(36, 122, 75, 0.25)',
          text: 'var(--color-success)',
          Icon: CheckCircle2,
        };
      case 'attention':
        return {
          bg: 'var(--color-attention-bg)',
          border: 'rgba(148, 98, 0, 0.25)',
          text: 'var(--color-attention)',
          Icon: AlertTriangle,
        };
      case 'critical':
        return {
          bg: 'var(--color-critical-bg)',
          border: 'rgba(180, 35, 24, 0.25)',
          text: 'var(--color-critical)',
          Icon: AlertCircle,
        };
      default:
        return {
          bg: 'var(--color-info-bg)',
          border: 'rgba(36, 93, 168, 0.25)',
          text: 'var(--color-info)',
          Icon: Info,
        };
    }
  };

  const { bg, border, text, Icon } = getConfig();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.875rem',
        padding: '0.875rem 1.125rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        width: '100%',
      }}
    >
      <Icon size={20} color={text} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
      <div style={{ flex: 1, fontSize: '0.875rem', lineHeight: 1.5 }}>
        {title && (
          <div style={{ fontWeight: 600, color: text, marginBottom: '0.25rem' }}>
            {title}
          </div>
        )}
        <div style={{ color: 'var(--color-text-main)' }}>{children}</div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
