import React from 'react';
import { FileText, Calendar, Building, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { MedicalDocument } from '../../types/document';
import { formatDate, formatFileSize, getDocumentTypeLabel, getStatusBadgeVariant } from '../../lib/formatters';

interface DocumentCardProps {
  document: MedicalDocument;
  onSelect: (doc: MedicalDocument) => void;
  onReview?: (doc: MedicalDocument) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onSelect,
  onReview,
}) => {
  return (
    <Card hoverable style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={20} />
          </div>
          <div>
            <h4
              style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                wordBreak: 'break-word',
                cursor: 'pointer',
              }}
              onClick={() => onSelect(document)}
            >
              {document.filename}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {getDocumentTypeLabel(document.documentType)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {formatFileSize(document.fileSize)}
              </span>
            </div>
          </div>
        </div>

        <Badge variant={getStatusBadgeVariant(document.status)}>
          {document.status === 'needs_review' ? 'Verify Fields' : document.status}
        </Badge>
      </div>

      {document.summary && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {document.summary}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--color-border)',
          paddingTop: '0.75rem',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={13} />
            {formatDate(document.documentDate || document.uploadDate)}
          </span>
          {document.facilityOrDoctor && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Building size={13} />
              {document.facilityOrDoctor}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {document.status === 'needs_review' && onReview ? (
            <button
              onClick={() => onReview(document)}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-attention)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <AlertCircle size={14} /> Review ({document.unverifiedFieldsCount})
            </button>
          ) : (
            <button
              onClick={() => onSelect(document)}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.125rem',
              }}
            >
              Details <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
