import React, { useState } from 'react';
import { Check, Edit2, X, FileSearch } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ConfidenceBadge } from './confidence-badge';
import { ExtractedField, ReviewStatus } from '../../types/extraction';

interface ExtractedFieldRowProps {
  field: ExtractedField;
  onUpdateStatus: (fieldId: string, status: ReviewStatus, correctedValue?: string) => void;
}

export const ExtractedFieldRow: React.FC<ExtractedFieldRowProps> = ({
  field,
  onUpdateStatus,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [valInput, setValInput] = useState(field.fieldValue);

  const handleSaveCorrection = () => {
    onUpdateStatus(field.id, 'corrected', valInput);
    setIsEditing(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        padding: '1.125rem',
        backgroundColor: field.reviewStatus === 'confirmed' ? 'var(--color-surface)' : 'var(--color-surface-hover)',
        border: `1px solid ${field.isAbnormal ? 'rgba(180, 35, 24, 0.25)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-main)' }}>
              {field.fieldName}
            </span>
            <ConfidenceBadge confidence={field.confidence} />
            {field.isAbnormal && (
              <Badge variant="critical" size="sm">Outside Reference Range</Badge>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
            Category: {field.category.replace('_', ' ')} • Page {field.pageNumber}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {field.reviewStatus === 'confirmed' || field.reviewStatus === 'corrected' ? (
            <Badge variant="success">
              <Check size={12} style={{ marginRight: '0.25rem' }} /> Verified
            </Badge>
          ) : (
            <>
              {!isEditing && (
                <>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onUpdateStatus(field.id, 'confirmed')}
                    leftIcon={<Check size={14} />}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    leftIcon={<Edit2 size={14} />}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onUpdateStatus(field.id, 'rejected')}
                    leftIcon={<X size={14} />}
                  >
                    Reject
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Value and Edit input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
        {isEditing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', maxWidth: '400px' }}>
            <input
              type="text"
              value={valInput}
              onChange={(e) => setValInput(e.target.value)}
              style={{
                flex: 1,
                padding: '0.375rem 0.625rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
              autoFocus
            />
            <Button size="sm" variant="primary" onClick={handleSaveCorrection}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: field.isAbnormal ? 'var(--color-critical)' : 'var(--color-text-main)' }}>
              {field.fieldValue}
            </span>
            {field.unit && (
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                {field.unit}
              </span>
            )}
            {field.referenceRange && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                (Lab Range: {field.referenceRange})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Raw OCR Snippet Evidence */}
      {field.sourceSnippet && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.625rem',
            backgroundColor: 'var(--color-bg)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
            borderLeft: '2px solid var(--color-primary)',
          }}
        >
          <FileSearch size={14} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
            Source OCR snippet: "{field.sourceSnippet}"
          </span>
        </div>
      )}
    </div>
  );
};
