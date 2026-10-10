export type ReviewStatus = 'unverified' | 'confirmed' | 'corrected' | 'rejected';

export interface ExtractedField {
  id: string;
  documentId: string;
  category: 'vital' | 'lab_test' | 'medication' | 'diagnosis' | 'date' | 'doctor';
  fieldName: string;
  fieldValue: string;
  normalizedValue?: string | number;
  unit?: string;
  referenceRange?: string;
  isAbnormal?: boolean;
  confidence: number; // 0.0 to 1.0
  pageNumber: number;
  sourceSnippet: string;
  reviewStatus: ReviewStatus;
}

export interface HealthFact {
  id: string;
  userId: string;
  category: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange: string;
  isOutOfRange: boolean;
  observedDate: string;
  sourceDocumentId: string;
  sourceDocumentName: string;
}
