import React from 'react';
import { CitationSource } from '../../types/chat';
import { FileText, ExternalLink, X } from 'lucide-react';

interface CitationPopoverProps {
  citation: CitationSource | null;
  onClose: () => void;
  onOpenDocument?: (docId: string) => void;
}

export const CitationPopover: React.FC<CitationPopoverProps> = ({
  citation,
  onClose,
  onOpenDocument,
}) => {
  if (!citation) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-dropdown)',
          maxWidth: '480px',
          width: '100%',
          padding: '1.25rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--color-primary)" />
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Source Verification & Grounding
            </h4>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Document</span>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
            {citation.documentName} (Page {citation.page})
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-bg)',
            padding: '0.875rem',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--color-primary)',
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary)',
            fontStyle: 'italic',
            lineHeight: 1.5,
            marginBottom: '1rem',
          }}
        >
          "{citation.snippet}"
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          {onOpenDocument && (
            <button
              onClick={() => {
                onOpenDocument(citation.documentId);
                onClose();
              }}
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              Open Document <ExternalLink size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
