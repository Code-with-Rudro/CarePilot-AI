import React from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { HealthFact } from '../../types/extraction';

interface TrendChartProps {
  testName: string;
  unit: string;
  facts: HealthFact[];
  referenceRangeText: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  testName,
  unit,
  facts,
  referenceRangeText,
}) => {
  if (facts.length === 0) return null;

  // Sort ascending by date
  const sorted = [...facts].sort((a, b) => new Date(a.observedDate).getTime() - new Date(b.observedDate).getTime());
  const values = sorted.map(f => f.value);
  const minVal = Math.min(...values) * 0.85;
  const maxVal = Math.max(...values) * 1.15;
  const range = maxVal - minVal || 1;

  const width = 500;
  const height = 160;
  const padX = 40;
  const padY = 25;

  const points = sorted.map((item, idx) => {
    const x = sorted.length === 1 ? width / 2 : padX + (idx / (sorted.length - 1)) * (width - 2 * padX);
    const y = height - padY - ((item.value - minVal) / range) * (height - 2 * padY);
    return { x, y, item };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
  }, '');

  const latest = sorted[sorted.length - 1];

  return (
    <Card style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
            {testName}
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Standard Interval: {referenceRangeText}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: latest.isOutOfRange ? 'var(--color-critical)' : 'var(--color-text-main)' }}>
              {latest.value}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              {unit}
            </span>
          </div>
          <Badge variant={latest.isOutOfRange ? 'critical' : 'success'} size="sm">
            {latest.isOutOfRange ? 'Outside Range' : 'In Range'}
          </Badge>
        </div>
      </div>

      {/* SVG Responsive Trend Visualizer */}
      <div style={{ width: '100%', overflowX: 'auto', padding: '0.5rem 0' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', maxHeight: '180px', overflow: 'visible' }}
        >
          {/* Reference baseline grid lines */}
          <line x1={padX} y1={padY} x2={width - padX} y2={padY} stroke="var(--color-border)" strokeDasharray="3 3" />
          <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="var(--color-border)" strokeDasharray="3 3" />

          {/* Trend line */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="5"
                fill={pt.item.isOutOfRange ? 'var(--color-critical)' : 'var(--color-primary)'}
                stroke="var(--color-surface)"
                strokeWidth="2"
              />
              <text
                x={pt.x}
                y={pt.y - 10}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="var(--color-text-main)"
              >
                {pt.item.value}
              </text>
              <text
                x={pt.x}
                y={height - 5}
                textAnchor="middle"
                fontSize="10"
                fill="var(--color-text-muted)"
              >
                {new Date(pt.item.observedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </Card>
  );
};
