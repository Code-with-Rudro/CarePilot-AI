import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { formatFileSize } from '../../lib/formatters';

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  selectedFile?: File | null;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileSelected,
  selectedFile,
  maxSizeBytes = 10 * 1024 * 1024, // 10 MB
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = (file: File) => {
    setValidationError(null);
    if (file.size > maxSizeBytes) {
      setValidationError(`File exceeds maximum size of ${maxSizeBytes / (1024 * 1024)} MB.`);
      return;
    }
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedTypes.includes(extension)) {
      setValidationError(`Unsupported file type. Accepted: ${acceptedTypes.join(', ')}`);
      return;
    }
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--color-primary)' : selectedFile ? 'var(--color-success)' : 'var(--color-border)'}`,
          backgroundColor: isDragging ? 'var(--color-accent)' : selectedFile ? 'var(--color-success-bg)' : 'var(--color-bg)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              validateAndSelect(e.target.files[0]);
            }
          }}
        />

        {selectedFile ? (
          <>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '0.9375rem' }}>
                {selectedFile.name}
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                {formatFileSize(selectedFile.size)} • Click to choose a different file
              </p>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UploadCloud size={24} />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '0.9375rem' }}>
                Click to browse or drag & drop medical document
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                Supported: PDF, JPG, PNG (Max 10 MB) • Prescriptions, Lab Reports, Discharge Summaries
              </p>
            </div>
          </>
        )}
      </div>

      {validationError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-critical)', fontSize: '0.8125rem' }}>
          <FileText size={16} />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
