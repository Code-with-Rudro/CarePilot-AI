export type DocumentType = 
  | 'prescription' 
  | 'lab_report' 
  | 'discharge_summary' 
  | 'imaging_report' 
  | 'diagnostic' 
  | 'general';

export type ProcessingStatus = 
  | 'uploaded' 
  | 'reading' 
  | 'extracting' 
  | 'needs_review' 
  | 'processed' 
  | 'failed';

export interface MedicalDocument {
  id: string;
  userId: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  uploadDate: string;
  documentDate?: string;
  facilityOrDoctor?: string;
  status: ProcessingStatus;
  summary?: string;
  extractedFieldsCount: number;
  unverifiedFieldsCount: number;
  fileUrl?: string;
  pageCount?: number;
}
