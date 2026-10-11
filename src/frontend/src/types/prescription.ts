export interface MedicationInstruction {
  id: string;
  name: string;
  strength: string; // e.g., 500mg
  dosage: string;   // e.g., 1 tablet
  route: string;    // Oral
  frequency: string;// Twice daily (1-0-1)
  timing: string;   // After food
  duration: string; // 5 days
  instructionsEnglish: string;
  instructionsTelugu?: string;
  instructionsHindi?: string;
  confidence: number;
  confirmed: boolean;
  warnings?: string[];
}

export interface Prescription {
  id: string;
  documentId: string;
  prescribedBy: string;
  prescribedDate: string;
  diagnosis?: string;
  medications: MedicationInstruction[];
  status: 'active' | 'completed' | 'archived';
}
