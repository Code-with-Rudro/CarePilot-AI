import React from 'react';
import { Modal } from '../../components/ui/modal';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Alert } from '../../components/ui/alert';
import { MedicalDocument } from '../../types/document';
import { ExtractedField } from '../../types/extraction';
import { formatDate, formatFileSize, getDocumentTypeLabel, getStatusBadgeVariant } from '../../lib/formatters';
import { FileText, Calendar, Building, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface DocumentViewerProps {
  document: MedicalDocument | null;
  extractedFields: ExtractedField[];
  onClose: () => void;
  onNavigateToReview?: () => void;
  onAskCopilotAboutDoc?: (filename: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  extractedFields,
  onClose,
  onNavigateToReview,
  onAskCopilotAboutDoc,
}) => {
  if (!document) return null;

  const docFields = extractedFields.filter(f => f.documentId === document.id);

  return (
    <Modal
      isOpen={Boolean(document)}
      onClose={onClose}
      title={document.filename}
      description={`${getDocumentTypeLabel(document.documentType)} • ${formatDate(document.documentDate)}`}
      maxWidth="780px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Metadata summary bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            backgroundColor: 'var(--color-bg)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            fontSize: '0.8125rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>Status</span>
            <div style={{ marginTop: '0.25rem' }}>
              <Badge variant={getStatusBadgeVariant(document.status)}>
                {document.status}
              </Badge>
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>Facility / Doctor</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
              {document.facilityOrDoctor || 'Not specified'}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>File Size</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
              {formatFileSize(document.fileSize)}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem' }}>Upload Time</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
              {formatDate(document.uploadDate)}
            </span>
          </div>
        </div>

        {/* AI Plain Language Summary */}
        {document.summary && (
          <div
            style={{
              backgroundColor: 'var(--color-accent)',
              border: '1px solid rgba(23, 107, 102, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} color="var(--color-primary)" /> AI-Generated Plain Language Summary
              </h4>
              <Badge variant="info">Grounded Summary</Badge>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', lineHeight: 1.55 }}>
              {document.summary}
            </p>
          </div>
        )}

        {/* Extracted Clinical Fields Table */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Extracted Parameters ({docFields.length})
            </h4>
            {document.status === 'needs_review' && onNavigateToReview && (
              <Button size="sm" variant="secondary" onClick={onNavigateToReview}>
                Verify & Correct Fields
              </Button>
            )}
          </div>

          {docFields.length > 0 ? (
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.625rem 0.875rem', fontWeight: 600 }}>Parameter</th>
                    <th style={{ padding: '0.625rem 0.875rem', fontWeight: 600 }}>Value</th>
                    <th style={{ padding: '0.625rem 0.875rem', fontWeight: 600 }}>Reference Range</th>
                    <th style={{ padding: '0.625rem 0.875rem', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {docFields.map((field) => (
                    <tr key={field.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.625rem 0.875rem', fontWeight: 500, color: 'var(--color-text-main)' }}>
                        {field.fieldName}
                      </td>
                      <td style={{ padding: '0.625rem 0.875rem', fontWeight: 600, color: field.isAbnormal ? 'var(--color-critical)' : 'var(--color-text-main)' }}>
                        {field.fieldValue} {field.unit}
                      </td>
                      <td style={{ padding: '0.625rem 0.875rem', color: 'var(--color-text-secondary)' }}>
                        {field.referenceRange || 'Standard'}
                      </td>
                      <td style={{ padding: '0.625rem 0.875rem' }}>
                        <Badge variant={field.isAbnormal ? 'critical' : 'success'} size="sm">
                          {field.isAbnormal ? 'Outside Range' : 'Normal'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              No structured parameters extracted yet.
            </p>
          )}
        </div>

        {/* Action controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          {onAskCopilotAboutDoc && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAskCopilotAboutDoc(document.filename)}
              rightIcon={<ArrowRight size={14} />}
            >
              Ask Copilot about this record
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
