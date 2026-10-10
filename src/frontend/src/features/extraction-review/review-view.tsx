import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert } from '../../components/ui/alert';
import { ExtractedFieldRow } from './extracted-field-row';
import { ExtractedField, ReviewStatus } from '../../types/extraction';
import { CheckCheck, ShieldCheck, Filter } from 'lucide-react';

interface ReviewViewProps {
  fields: ExtractedField[];
  onUpdateField: (fieldId: string, status: ReviewStatus, correctedValue?: string) => void;
  onNavigateToTimeline?: () => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  fields,
  onUpdateField,
  onNavigateToTimeline,
}) => {
  const [filter, setFilter] = useState<'all' | 'unverified' | 'abnormal'>('all');

  const unverifiedCount = fields.filter(f => f.reviewStatus === 'unverified').length;
  const abnormalCount = fields.filter(f => f.isAbnormal).length;

  const filteredFields = fields.filter(f => {
    if (filter === 'unverified') return f.reviewStatus === 'unverified';
    if (filter === 'abnormal') return f.isAbnormal;
    return true;
  });

  const handleVerifyAll = () => {
    fields.forEach(f => {
      if (f.reviewStatus === 'unverified') {
        onUpdateField(f.id, 'confirmed');
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header explanation */}
      <Card style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                Clinical Extraction Review & Verification
              </h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', maxWidth: '640px' }}>
              Review machine-extracted values against original document snippets. Once confirmed, these parameters become trusted structured facts in your health timeline and copilot answers.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {unverifiedCount > 0 && (
              <Button
                variant="primary"
                onClick={handleVerifyAll}
                leftIcon={<CheckCheck size={16} />}
              >
                Confirm All High Confidence
              </Button>
            )}
            {onNavigateToTimeline && (
              <Button
                variant="secondary"
                onClick={onNavigateToTimeline}
              >
                View Timeline & Trends
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.5rem' }}>
            <Filter size={14} /> Filter:
          </span>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: filter === 'all' ? 600 : 500,
              backgroundColor: filter === 'all' ? 'var(--color-primary)' : 'var(--color-bg)',
              color: filter === 'all' ? '#ffffff' : 'var(--color-text-secondary)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            All Parameters ({fields.length})
          </button>
          <button
            onClick={() => setFilter('unverified')}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: filter === 'unverified' ? 600 : 500,
              backgroundColor: filter === 'unverified' ? 'var(--color-attention)' : 'var(--color-bg)',
              color: filter === 'unverified' ? '#ffffff' : 'var(--color-text-secondary)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Needs Review ({unverifiedCount})
          </button>
          <button
            onClick={() => setFilter('abnormal')}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: filter === 'abnormal' ? 600 : 500,
              backgroundColor: filter === 'abnormal' ? 'var(--color-critical)' : 'var(--color-bg)',
              color: filter === 'abnormal' ? '#ffffff' : 'var(--color-text-secondary)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Outside Range ({abnormalCount})
          </button>
        </div>
      </Card>

      {/* Extracted Fields List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {filteredFields.map((field) => (
          <ExtractedFieldRow
            key={field.id}
            field={field}
            onUpdateStatus={onUpdateField}
          />
        ))}

        {filteredFields.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              No parameters found matching the selected filter.
            </p>
          </div>
        )}
      </div>

      <Alert type="info">
        <strong>Human-in-the-Loop Principle:</strong> Medical OCR systems can occasionally misread faint handwriting or confusing decimal points. Always cross-check flagged parameters with your original prescription or lab report printout.
      </Alert>
    </div>
  );
};
