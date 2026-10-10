import { MedicalDocument, DocumentType } from '../types/document';
import { ExtractedField, HealthFact, ReviewStatus } from '../types/extraction';
import { ChatMessage, CitationSource } from '../types/chat';
import { Prescription } from '../types/prescription';
import { MedicationReminder } from '../types/reminder';
import { 
  INITIAL_DOCUMENTS, 
  INITIAL_EXTRACTED_FIELDS, 
  INITIAL_HEALTH_FACTS, 
  INITIAL_PRESCRIPTIONS, 
  INITIAL_REMINDERS,
  VERIFIED_MEDICINE_CATALOG,
  VerifiedMedicineInfo
} from './constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiClient {
  private documents: MedicalDocument[] = [...INITIAL_DOCUMENTS];
  private extractedFields: ExtractedField[] = [...INITIAL_EXTRACTED_FIELDS];
  private healthFacts: HealthFact[] = [...INITIAL_HEALTH_FACTS];
  private prescriptions: Prescription[] = [...INITIAL_PRESCRIPTIONS];
  private reminders: MedicationReminder[] = [...INITIAL_REMINDERS];

  // Documents
  async getDocuments(): Promise<MedicalDocument[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/documents`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback to local state
    }
    return [...this.documents];
  }

  async getDocument(id: string): Promise<MedicalDocument | undefined> {
    try {
      const res = await fetch(`${API_BASE_URL}/documents/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return this.documents.find(d => d.id === id);
  }

  async uploadDocument(
    file: File, 
    documentType: DocumentType, 
    facility?: string,
    onProgress?: (step: string, percent: number) => void
  ): Promise<MedicalDocument> {
    onProgress?.('Uploading encrypted document...', 25);
    await new Promise(r => setTimeout(r, 600));

    onProgress?.('Validating document integrity & scanning...', 50);
    await new Promise(r => setTimeout(r, 700));

    onProgress?.('Extracting clinical entities with OCR engine...', 75);
    await new Promise(r => setTimeout(r, 900));

    onProgress?.('Generating grounded health summary...', 95);
    await new Promise(r => setTimeout(r, 600));

    const newDocId = `doc-${Date.now()}`;
    const newDoc: MedicalDocument = {
      id: newDocId,
      userId: 'user-rudro',
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/pdf',
      documentType,
      uploadDate: new Date().toISOString(),
      documentDate: new Date().toISOString().split('T')[0],
      facilityOrDoctor: facility || 'Verified Medical Center',
      status: 'needs_review',
      summary: `Automated extraction completed for ${file.name}. Key clinical parameters identified and highlighted for review.`,
      extractedFieldsCount: 5,
      unverifiedFieldsCount: 2,
      pageCount: 1,
    };

    // Add generated demo fields for review
    const generatedFields: ExtractedField[] = [
      {
        id: `field-${Date.now()}-1`,
        documentId: newDocId,
        category: 'lab_test',
        fieldName: 'Serum Ferritin',
        fieldValue: '28',
        normalizedValue: 28,
        unit: 'ng/mL',
        referenceRange: '30 - 400 ng/mL',
        isAbnormal: true,
        confidence: 0.94,
        pageNumber: 1,
        sourceSnippet: `Ferritin (ECLIA): 28 ng/mL [Reference: 30.0 - 400.0]`,
        reviewStatus: 'unverified',
      },
      {
        id: `field-${Date.now()}-2`,
        documentId: newDocId,
        category: 'vital',
        fieldName: 'Blood Pressure (Sitting)',
        fieldValue: '128/84',
        unit: 'mmHg',
        referenceRange: '< 120/80 mmHg',
        isAbnormal: true,
        confidence: 0.88,
        pageNumber: 1,
        sourceSnippet: `Recorded BP: 128/84 mmHg`,
        reviewStatus: 'unverified',
      },
      {
        id: `field-${Date.now()}-3`,
        documentId: newDocId,
        category: 'lab_test',
        fieldName: 'Serum Creatinine',
        fieldValue: '0.9',
        normalizedValue: 0.9,
        unit: 'mg/dL',
        referenceRange: '0.7 - 1.3 mg/dL',
        isAbnormal: false,
        confidence: 0.99,
        pageNumber: 1,
        sourceSnippet: `Creatinine (Enzymatic): 0.9 mg/dL [0.7 - 1.3]`,
        reviewStatus: 'confirmed',
      }
    ];

    this.documents.unshift(newDoc);
    this.extractedFields.push(...generatedFields);
    onProgress?.('Extraction ready for human verification', 100);
    return newDoc;
  }

  // Extractions
  async getExtractedFields(documentId?: string): Promise<ExtractedField[]> {
    if (documentId) {
      return this.extractedFields.filter(f => f.documentId === documentId);
    }
    return [...this.extractedFields];
  }

  async updateExtractedField(
    fieldId: string, 
    reviewStatus: ReviewStatus, 
    correctedValue?: string
  ): Promise<ExtractedField | undefined> {
    const idx = this.extractedFields.findIndex(f => f.id === fieldId);
    if (idx !== -1) {
      this.extractedFields[idx].reviewStatus = reviewStatus;
      if (correctedValue !== undefined) {
        this.extractedFields[idx].fieldValue = correctedValue;
        this.extractedFields[idx].normalizedValue = correctedValue;
      }

      // If confirmed, sync to health facts
      if (reviewStatus === 'confirmed' || reviewStatus === 'corrected') {
        const field = this.extractedFields[idx];
        const numVal = parseFloat(field.fieldValue);
        if (!isNaN(numVal)) {
          this.healthFacts.push({
            id: `fact-${Date.now()}`,
            userId: 'user-rudro',
            category: field.category === 'lab_test' ? 'Diagnostic Lab' : 'Health Metric',
            testName: field.fieldName,
            value: numVal,
            unit: field.unit || '',
            referenceRange: field.referenceRange || 'Standard',
            isOutOfRange: field.isAbnormal || false,
            observedDate: new Date().toISOString().split('T')[0],
            sourceDocumentId: field.documentId,
            sourceDocumentName: this.documents.find(d => d.id === field.documentId)?.filename || 'Uploaded Document',
          });
        }
      }

      return { ...this.extractedFields[idx] };
    }
    return undefined;
  }

  // Health Facts / Timeline
  async getHealthFacts(): Promise<HealthFact[]> {
    return [...this.healthFacts];
  }

  // Prescriptions
  async getPrescriptions(): Promise<Prescription[]> {
    return [...this.prescriptions];
  }

  // Reminders
  async getReminders(): Promise<MedicationReminder[]> {
    return [...this.reminders];
  }

  async updateReminderStatus(id: string, status: 'taken' | 'skipped' | 'snoozed'): Promise<MedicationReminder | undefined> {
    const reminder = this.reminders.find(r => r.id === id);
    if (reminder) {
      reminder.status = status;
      if (status === 'taken') {
        reminder.takenAt = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      }
      return { ...reminder };
    }
    return undefined;
  }

  async createReminder(reminder: Omit<MedicationReminder, 'id' | 'status'>): Promise<MedicationReminder> {
    const newRem: MedicationReminder = {
      ...reminder,
      id: `rem-${Date.now()}`,
      status: 'pending',
    };
    this.reminders.push(newRem);
    return newRem;
  }

  // Copilot RAG Q&A
  async askCopilot(question: string): Promise<ChatMessage> {
    await new Promise(r => setTimeout(r, 800));

    const qLower = question.toLowerCase();
    let content = '';
    const citations: CitationSource[] = [];
    let insufficientEvidence = false;

    if (qLower.includes('haemoglobin') || qLower.includes('hemoglobin') || qLower.includes('blood count') || qLower.includes('anemia')) {
      content = 'According to your Complete Blood Count report dated October 7, 2026 from Apollo Diagnostics, your Haemoglobin level is recorded as **11.2 g/dL**, which is below the laboratory reference interval of **13.0 – 17.0 g/dL**.\n\nYour White Blood Cell (7,400 cells/mcL) and Platelet (240,000 cells/mcL) counts remain in the normal range. Because your haemoglobin reflects mild microcytic anemia, discuss dietary iron intake or an iron-profile evaluation with your physician.';
      citations.push({
        documentId: 'doc-001',
        documentName: 'Apollo_Complete_Blood_Count_Report.pdf',
        page: 1,
        snippet: 'Haemoglobin (Cyanmethemoglobin method): 11.2 g/dL [13.0 - 17.0]',
      });
    } else if (qLower.includes('metoprolol') || qLower.includes('blood pressure') || qLower.includes('bp') || qLower.includes('heart')) {
      content = 'Your prescription from Dr. K. Srinivas (Care Hospitals, Oct 9, 2026) specifies **Metoprolol Tartrate 25mg**, 1 tablet once daily in the morning after food.\n\n**Instructions (English):** Take 1 tablet every morning after breakfast. Do not stop abruptly without clinician oversight.\n\n**తెలుగు వివరణ (Telugu):** ప్రతిరోజూ ఉదయం అల్పాహారం తర్వాత 1 టాబ్లెట్ వేసుకోండి. వైద్యుడి సలహా లేకుండా అకస్మాత్తుగా ఆపవద్దు.';
      citations.push({
        documentId: 'doc-002',
        documentName: 'Care_Hospital_Cardio_Prescription.png',
        page: 1,
        snippet: 'Tab. Metoprolol 25mg - 1 Tab OD Morning after food x 30 days',
      });
    } else if (qLower.includes('sugar') || qLower.includes('glucose') || qLower.includes('diabetes') || qLower.includes('hba1c')) {
      content = 'Your metabolic panel from Metropolis Healthcare (Sept 23, 2026) shows favorable glycemic markers:\n\n• **Fasting Blood Sugar:** 98 mg/dL (Normal reference: 70–100 mg/dL)\n• **HbA1c:** 5.6% (Non-diabetic reference: < 5.7%)\n\nBoth parameters are within standard clinical targets.';
      citations.push({
        documentId: 'doc-003',
        documentName: 'Metropolis_Comprehensive_Metabolic_Panel.pdf',
        page: 1,
        snippet: 'Glucose, Fasting: 98 mg/dL [70 - 100]; HbA1c: 5.6% [< 5.7%]',
      });
    } else if (qLower.includes('pantoprazole') || qLower.includes('acidity') || qLower.includes('stomach')) {
      content = 'Your records show a prescription for **Pantoprazole 40mg** to manage acid peptic symptoms. The instruction notes taking 1 tablet in the morning, 30 minutes before breakfast.\n\n*Note:* The dosage text on your uploaded handwritten scan had moderate confidence (72%) and is currently marked for your review.';
      citations.push({
        documentId: 'doc-002',
        documentName: 'Care_Hospital_Cardio_Prescription.png',
        page: 1,
        snippet: 'Tab. Panto? 40mg - 1 Tab Before Breakfast x 15 days',
      });
    } else {
      insufficientEvidence = true;
      content = 'I searched your uploaded medical documents, but **no verified evidence** matching this specific question was found in your active records.\n\nAs a safe health copilot, I do not guess or extrapolate clinical conclusions without source documentation. You can upload relevant reports or consult your primary healthcare provider.';
    }

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      citations,
      insufficientEvidence,
      disclaimer: 'This informational response is grounded in your uploaded records and does not replace a clinician evaluation.',
      suggestedQuestions: [
        'What does my Haemoglobin trend show?',
        'How should I take Metoprolol Tartrate?',
        'Show my latest Fasting Blood Glucose result',
      ],
    };
  }

  // Medicine Recognition & Verification for AR Assistant
  async lookupMedicine(query: string): Promise<VerifiedMedicineInfo | null> {
    await new Promise(r => setTimeout(r, 400));
    const clean = query.toLowerCase().trim();
    for (const key of Object.keys(VERIFIED_MEDICINE_CATALOG)) {
      if (clean.includes(key)) {
        return VERIFIED_MEDICINE_CATALOG[key];
      }
    }
    // Default fallback to Paracetamol for generic scan demonstration
    return VERIFIED_MEDICINE_CATALOG['paracetamol'];
  }
}

export const apiClient = new ApiClient();
