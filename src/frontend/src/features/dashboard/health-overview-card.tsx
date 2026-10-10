import React from 'react';

interface HealthOverviewCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  colorClass?: string;
}

export const HealthOverviewCard: React.FC<HealthOverviewCardProps> = ({
  title, value, subtitle, icon, trend,
}) => {
  const trendColor = trend === 'up' ? 'var(--color-critical)' : trend === 'down' ? 'var(--color-success)' : 'var(--color-text-muted)';

  return (
    <div style={{
      background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
      padding: '1.25rem 1.5rem', border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '0.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {icon && <span style={{ color: 'var(--color-primary)' }}>{icon}</span>}
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-main)', lineHeight: 1.1 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.8125rem', color: trend ? trendColor : 'var(--color-text-muted)' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};
