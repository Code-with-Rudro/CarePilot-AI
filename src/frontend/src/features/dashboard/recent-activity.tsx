import React from 'react';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { MedicalDocument } from '../../types/document';

interface RecentActivityProps {
  documents: MedicalDocument[];
  onSelectDocument: (doc: MedicalDocument) => void;
}

const typeIcon: Record<string, React.ReactNode> = {
  lab_report: <FileText size={16} />,
  prescription: <FileText size={16} />,
  default: <FileText size={16} />,
};

export const RecentActivity: React.FC<RecentActivityProps> = ({ documents, onSelectDocument }) => {
  const recent = documents.slice(0, 5);

  if (recent.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-muted)' }}>
        <Upload size={32} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.4 }} />
        <p>No records yet. Upload your first medical document.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {recent.map(doc => (
        <button
          key={doc.id}
          onClick={() => onSelectDocument(doc)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            padding: '0.875rem 1rem', background: 'transparent',
            border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)',
            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
            transition: 'background var(--transition-fast)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{ color: 'var(--color-primary)', flexShrink: 0 }}>
            {typeIcon[doc.documentType] ?? typeIcon.default}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--color-text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {doc.filename}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {doc.facilityOrDoctor ?? doc.documentType} · {new Date(doc.uploadDate).toLocaleDateString()}
            </div>
          </div>
          {doc.status === 'processed' ? (
            <CheckCircle size={16} color="var(--color-success)" />
          ) : doc.status === 'failed' ? (
            <AlertCircle size={16} color="var(--color-critical)" />
          ) : null}
        </button>
      ))}
    </div>
  );
};
