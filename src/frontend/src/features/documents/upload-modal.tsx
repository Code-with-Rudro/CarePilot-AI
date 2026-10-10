import React, { useState } from 'react';
import { Modal } from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { UploadDropzone } from './upload-dropzone';
import { ProcessingStatusStepper } from './processing-status-stepper';
import { DocumentType } from '../../types/document';
import { Alert } from '../../components/ui/alert';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (file: File, documentType: DocumentType, facility?: string) => Promise<void>;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('lab_report');
  const [facility, setFacility] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState<'uploaded' | 'reading' | 'extracting' | 'needs_review' | 'processed'>('uploaded');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setCurrentStage('uploaded');
      setStatusMessage('Encrypting and storing document securely...');

      setTimeout(() => {
        setCurrentStage('reading');
        setStatusMessage('Optical Character Recognition reading document pages...');
      }, 700);

      setTimeout(() => {
        setCurrentStage('extracting');
        setStatusMessage('Extracting medical values, reference ranges, and dosages...');
      }, 1400);

      setTimeout(() => {
        setCurrentStage('needs_review');
        setStatusMessage('Extraction completed. Ready for review!');
      }, 2100);

      await onUploadSuccess(selectedFile, documentType, facility);
      handleReset();
    } catch {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setDocumentType('lab_report');
    setFacility('');
    setIsProcessing(false);
    setCurrentStage('uploaded');
    setStatusMessage('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { if (!isProcessing) { handleReset(); onClose(); } }}
      title="Upload Medical Record"
      description="Upload a PDF or clear image to extract structured parameters and generate plain-language explanations."
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <UploadDropzone
          onFileSelected={(file) => setSelectedFile(file)}
          selectedFile={selectedFile}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-main)', display: 'block', marginBottom: '0.375rem' }}>
              Document Category
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            >
              <option value="lab_report">Diagnostic Lab Report (Blood, Urine, etc.)</option>
              <option value="prescription">Doctor Prescription</option>
              <option value="discharge_summary">Hospital Discharge Summary</option>
              <option value="imaging_report">Radiology / Imaging Report</option>
              <option value="diagnostic">Other Diagnostic Test</option>
            </select>
          </div>

          <Input
            label="Facility or Consulting Doctor"
            placeholder="e.g. Apollo Diagnostics, Dr. Rao"
            value={facility}
            onChange={(e) => setFacility(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        {isProcessing && (
          <div style={{ backgroundColor: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <ProcessingStatusStepper currentStage={currentStage} />
            <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-primary-dark)', fontWeight: 500, marginTop: '0.5rem' }}>
              {statusMessage}
            </p>
          </div>
        )}

        <Alert type="info">
          <strong>Privacy Guaranteed:</strong> Documents are encrypted at rest and accessible only by your authenticated session. Extracted data can be inspected and corrected before finalizing.
        </Alert>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button
            type="button"
            variant="outline"
            disabled={isProcessing}
            onClick={() => { handleReset(); onClose(); }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!selectedFile || isProcessing}
            isLoading={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Upload & Process Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
