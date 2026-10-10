import React, { useState } from 'react';
import { Search, Filter, Plus, FileText } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { DocumentCard } from './document-card';
import { DocumentViewer } from './document-viewer';
import { UploadModal } from './upload-modal';
import { useDocuments } from '../../hooks/use-documents';
import { MedicalDocument } from '../../types/document';
import { ExtractedField } from '../../types/extraction';

interface DocumentListProps {
  onNavigateToReview?: () => void;
  onAskCopilot?: (query: string) => void;
  extractedFields: ExtractedField[];
}

export const DocumentList: React.FC<DocumentListProps> = ({
  onNavigateToReview,
  onAskCopilot,
  extractedFields,
}) => {
  const {
    documents,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    uploadFile,
    refreshDocuments,
  } = useDocuments();

  const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  const documentTypes = [
    { id: 'all', label: 'All Records' },
    { id: 'lab_report', label: 'Lab Reports' },
    { id: 'prescription', label: 'Prescriptions' },
    { id: 'discharge_summary', label: 'Discharge Summaries' },
    { id: 'diagnostic', label: 'Diagnostics' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search and Filter Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          backgroundColor: 'var(--color-surface)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ flex: '1 1 280px', maxWidth: '420px' }}>
          <Input
            placeholder="Search records by name, doctor, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          {documentTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              style={{
                padding: '0.4375rem 0.875rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: selectedType === t.id ? 600 : 500,
                backgroundColor: selectedType === t.id ? 'var(--color-primary)' : 'var(--color-bg)',
                color: selectedType === t.id ? '#ffffff' : 'var(--color-text-secondary)',
                border: `1px solid ${selectedType === t.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                transition: 'all var(--transition-fast)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          onClick={() => setIsUploadOpen(true)}
          leftIcon={<Plus size={16} />}
        >
          Upload New Record
        </Button>
      </div>

      {/* Grid of Medical Records */}
      {documents.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onSelect={(d) => setSelectedDoc(d)}
              onReview={() => onNavigateToReview?.()}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--color-border)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <FileText size={28} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
            No records match your criteria
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.375rem', maxWidth: '400px', margin: '0.375rem auto 1.25rem' }}>
            Try adjusting your search terms or upload a new medical document to extract its contents.
          </p>
          <Button variant="primary" onClick={() => setIsUploadOpen(true)} leftIcon={<Plus size={16} />}>
            Upload Medical Record
          </Button>
        </div>
      )}

      {/* Document Viewer Modal */}
      <DocumentViewer
        document={selectedDoc}
        extractedFields={extractedFields}
        onClose={() => setSelectedDoc(null)}
        onNavigateToReview={onNavigateToReview}
        onAskCopilotAboutDoc={(fname) => onAskCopilot?.(`What does my ${fname} show?`)}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={async (file, type, facility) => {
          await uploadFile(file, type, facility);
          await refreshDocuments();
          setIsUploadOpen(false);
          onNavigateToReview?.();
        }}
      />
    </div>
  );
};
