import { User } from '../types/user';
import { MedicalDocument } from '../types/document';
import { ExtractedField, HealthFact } from '../types/extraction';
import { Prescription } from '../types/prescription';
import { MedicationReminder } from '../types/reminder';

export const APP_NAME = 'CarePilot AI';
export const APP_TAGLINE = 'Your AI-Powered Personal Health Copilot';

export const DEMO_USERS: User[] = [
  {
    id: 'user-rudro',
    name: 'Rudro Prasad',
    email: 'rudro@altrixlabs.ai',
    role: 'patient',
    abhaId: '91-4432-8812-9901',
    age: 28,
    gender: 'Male',
    bloodGroup: 'O+',
    emergencyContact: '+91 98765 43210',
  },
  {
    id: 'user-demo-patient',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    role: 'patient',
    abhaId: '91-1029-3847-5610',
    age: 42,
    gender: 'Female',
    bloodGroup: 'B+',
    emergencyContact: '+91 91234 56789',
  },
  {
    id: 'user-caregiver',
    name: 'Vikram Sharma',
    email: 'vikram.caregiver@example.com',
    role: 'caregiver',
  }
];

export const INITIAL_DOCUMENTS: MedicalDocument[] = [
  {
    id: 'doc-001',
    userId: 'user-rudro',
    filename: 'Apollo_Complete_Blood_Count_Report.pdf',
    fileSize: 1420000,
    mimeType: 'application/pdf',
    documentType: 'lab_report',
    uploadDate: '2026-10-08T10:30:00Z',
    documentDate: '2026-10-07',
    facilityOrDoctor: 'Apollo Diagnostics, Jubilee Hills',
    status: 'processed',
    summary: 'CBC shows mild microcytic anemia with Haemoglobin at 11.2 g/dL. White blood cell count and platelets are within physiological limits. Iron studies recommended by consulting physician.',
    extractedFieldsCount: 8,
    unverifiedFieldsCount: 0,
    pageCount: 2,
  },
  {
    id: 'doc-002',
    userId: 'user-rudro',
    filename: 'Care_Hospital_Cardio_Prescription.png',
    fileSize: 890000,
    mimeType: 'image/png',
    documentType: 'prescription',
    uploadDate: '2026-10-09T14:15:00Z',
    documentDate: '2026-10-09',
    facilityOrDoctor: 'Dr. K. Srinivas (Cardiology), Care Hospitals',
    status: 'needs_review',
    summary: 'Prescription for blood pressure management and acidity. Contains Metoprolol Tartrate 25mg and Pantoprazole 40mg. Telugu translation available for instructions.',
    extractedFieldsCount: 6,
    unverifiedFieldsCount: 2,
    pageCount: 1,
  },
  {
    id: 'doc-003',
    userId: 'user-rudro',
    filename: 'Metropolis_Comprehensive_Metabolic_Panel.pdf',
    fileSize: 2100000,
    mimeType: 'application/pdf',
    documentType: 'diagnostic',
    uploadDate: '2026-09-24T09:00:00Z',
    documentDate: '2026-09-23',
    facilityOrDoctor: 'Metropolis Healthcare',
    status: 'processed',
    summary: 'Fasting Blood Glucose 98 mg/dL (Normal). Serum Creatinine 0.9 mg/dL (Normal). HbA1c is 5.6%, indicating normal glycemic control.',
    extractedFieldsCount: 12,
    unverifiedFieldsCount: 0,
    pageCount: 3,
  }
];

export const INITIAL_EXTRACTED_FIELDS: ExtractedField[] = [
  {
    id: 'field-1',
    documentId: 'doc-001',
    category: 'lab_test',
    fieldName: 'Haemoglobin',
    fieldValue: '11.2',
    normalizedValue: 11.2,
    unit: 'g/dL',
    referenceRange: '13.0 - 17.0 g/dL',
    isAbnormal: true,
    confidence: 0.98,
    pageNumber: 1,
    sourceSnippet: 'Haemoglobin (Cyanmethemoglobin method): 11.2 g/dL [13.0 - 17.0]',
    reviewStatus: 'confirmed',
  },
  {
    id: 'field-2',
    documentId: 'doc-001',
    category: 'lab_test',
    fieldName: 'Total Leukocyte Count (WBC)',
    fieldValue: '7,400',
    normalizedValue: 7400,
    unit: 'cells/mcL',
    referenceRange: '4,000 - 11,000 cells/mcL',
    isAbnormal: false,
    confidence: 0.96,
    pageNumber: 1,
    sourceSnippet: 'Total Leucocyte Count: 7,400 /cu.mm [4000-11000]',
    reviewStatus: 'confirmed',
  },
  {
    id: 'field-3',
    documentId: 'doc-001',
    category: 'lab_test',
    fieldName: 'Platelet Count',
    fieldValue: '240,000',
    normalizedValue: 240000,
    unit: 'cells/mcL',
    referenceRange: '150,000 - 450,000 cells/mcL',
    isAbnormal: false,
    confidence: 0.99,
    pageNumber: 1,
    sourceSnippet: 'Platelet Count: 2.40 Lakhs/cumm [1.5-4.5]',
    reviewStatus: 'confirmed',
  },
  {
    id: 'field-4',
    documentId: 'doc-002',
    category: 'medication',
    fieldName: 'Metoprolol Tartrate',
    fieldValue: '25mg',
    unit: 'mg',
    confidence: 0.94,
    pageNumber: 1,
    sourceSnippet: 'Tab. Metoprolol 25mg - 1 Tab OD Morning after food x 30 days',
    reviewStatus: 'confirmed',
  },
  {
    id: 'field-5',
    documentId: 'doc-002',
    category: 'medication',
    fieldName: 'Pantoprazole Sodium',
    fieldValue: '40mg',
    unit: 'mg',
    confidence: 0.72,
    pageNumber: 1,
    sourceSnippet: 'Tab. Panto? 40mg - 1 Tab Before Breakfast x 15 days',
    reviewStatus: 'unverified',
  },
  {
    id: 'field-6',
    documentId: 'doc-003',
    category: 'lab_test',
    fieldName: 'Fasting Blood Sugar (FBS)',
    fieldValue: '98',
    normalizedValue: 98,
    unit: 'mg/dL',
    referenceRange: '70 - 100 mg/dL',
    isAbnormal: false,
    confidence: 0.97,
    pageNumber: 1,
    sourceSnippet: 'Glucose, Fasting (Hexokinase): 98 mg/dL [70 - 100]',
    reviewStatus: 'confirmed',
  },
  {
    id: 'field-7',
    documentId: 'doc-003',
    category: 'lab_test',
    fieldName: 'HbA1c (Glycated Hemoglobin)',
    fieldValue: '5.6',
    normalizedValue: 5.6,
    unit: '%',
    referenceRange: '< 5.7 % (Normal)',
    isAbnormal: false,
    confidence: 0.99,
    pageNumber: 2,
    sourceSnippet: 'HbA1c (HPLC method): 5.6% [Non-diabetic < 5.7%]',
    reviewStatus: 'confirmed',
  }
];

export const INITIAL_HEALTH_FACTS: HealthFact[] = [
  {
    id: 'fact-1',
    userId: 'user-rudro',
    category: 'Blood Count',
    testName: 'Haemoglobin',
    value: 11.2,
    unit: 'g/dL',
    referenceRange: '13.0 - 17.0',
    isOutOfRange: true,
    observedDate: '2026-10-07',
    sourceDocumentId: 'doc-001',
    sourceDocumentName: 'Apollo_Complete_Blood_Count_Report.pdf',
  },
  {
    id: 'fact-2',
    userId: 'user-rudro',
    category: 'Blood Count',
    testName: 'Haemoglobin (Past)',
    value: 11.8,
    unit: 'g/dL',
    referenceRange: '13.0 - 17.0',
    isOutOfRange: true,
    observedDate: '2026-06-15',
    sourceDocumentId: 'doc-prev',
    sourceDocumentName: 'Historical_Lab_Record_Jun2026.pdf',
  },
  {
    id: 'fact-3',
    userId: 'user-rudro',
    category: 'Glucose',
    testName: 'Fasting Blood Sugar',
    value: 98,
    unit: 'mg/dL',
    referenceRange: '70 - 100',
    isOutOfRange: false,
    observedDate: '2026-09-23',
    sourceDocumentId: 'doc-003',
    sourceDocumentName: 'Metropolis_CMP.pdf',
  },
  {
    id: 'fact-4',
    userId: 'user-rudro',
    category: 'Diabetes Care',
    testName: 'HbA1c',
    value: 5.6,
    unit: '%',
    referenceRange: '< 5.7',
    isOutOfRange: false,
    observedDate: '2026-09-23',
    sourceDocumentId: 'doc-003',
    sourceDocumentName: 'Metropolis_CMP.pdf',
  }
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [];

export const INITIAL_REMINDERS: MedicationReminder[] = [
  {
    id: 'rem-1',
    medicationName: 'Pantoprazole',
    strength: '40mg',
    dosage: '1 Tablet (40mg)',
    frequency: 'Once daily',
    phoneNumber: '+91 98765 43210',
    recipientName: 'Rudro Sharma',
    smsEnabled: true,
    smsConsent: true,
    smsStatus: 'sent',
    smsSentAt: '07:30 AM',
    scheduledTime: '07:30 AM',
    slot: 'morning',
    timingWithFood: '30 min before breakfast',
    status: 'taken',
    takenAt: '07:32 AM',
  },
  {
    id: 'rem-2',
    medicationName: 'Metoprolol',
    strength: '25mg',
    dosage: '1 Tablet (25mg)',
    frequency: 'Once daily',
    phoneNumber: '+91 98765 43210',
    recipientName: 'Rudro Sharma',
    smsEnabled: true,
    smsConsent: true,
    smsStatus: 'sent',
    smsSentAt: '08:30 AM',
    scheduledTime: '08:30 AM',
    slot: 'morning',
    timingWithFood: 'After breakfast',
    status: 'taken',
    takenAt: '08:45 AM',
  },
  {
    id: 'rem-3',
    medicationName: 'Calcium + Vit D3',
    strength: '500mg',
    dosage: '1 Tablet',
    frequency: 'Once daily',
    phoneNumber: '+91 98765 43210',
    recipientName: 'Rudro Sharma',
    smsEnabled: true,
    smsConsent: true,
    smsStatus: 'scheduled',
    scheduledTime: '01:30 PM',
    slot: 'afternoon',
    timingWithFood: 'After lunch',
    status: 'pending',
  },
  {
    id: 'rem-4',
    medicationName: 'Evening Walk & Hydration Check',
    strength: 'Wellness',
    dosage: '1 Glass Water',
    frequency: 'Daily',
    phoneNumber: '+91 98765 43210',
    recipientName: 'Rudro Sharma',
    smsEnabled: false,
    smsConsent: false,
    smsStatus: 'disabled',
    scheduledTime: '06:00 PM',
    slot: 'evening',
    timingWithFood: 'Evening',
    status: 'pending',
  }
];

export interface VerifiedMedicineInfo {
  name: string;
  genericName: string;
  strength: string;
  category: string;
  manufacturer: string;
  indications: string[];
  precautions: string[];
  sideEffects: string[];
  dosageGuidelines: string;
  verifiedSource: string;
}

export const VERIFIED_MEDICINE_CATALOG: Record<string, VerifiedMedicineInfo> = {
  'paracetamol': {
    name: 'Paracetamol / Dolo',
    genericName: 'Acetaminophen',
    strength: '650mg / 500mg',
    category: 'Analgesic & Antipyretic',
    manufacturer: 'Micro Labs / GSK',
    indications: ['Fever reduction', 'Mild to moderate body pain', 'Headache & toothache relief'],
    precautions: [
      'Do not exceed 4,000mg per 24-hour period.',
      'Exercise caution if you have liver impairment or chronic alcohol intake.',
      'Avoid taking simultaneously with other acetaminophen-containing cold remedies.'
    ],
    sideEffects: ['Nausea (rare)', 'Allergic rash (rare)', 'Liver toxicity in overdose'],
    dosageGuidelines: 'Adults: 1 tablet every 4 to 6 hours as needed. Do not exceed 4 tablets in 24 hours.',
    verifiedSource: 'Indian Pharmacopoeia (IP) / National Formulary of India',
  },
  'amoxicillin': {
    name: 'Amoxicillin / Augmentin',
    genericName: 'Amoxicillin Trihydrate',
    strength: '500mg / 625mg',
    category: 'Penicillin Antibiotic',
    manufacturer: 'GSK / Cipla',
    indications: ['Bacterial respiratory tract infections', 'Ear, nose, and throat infections', 'Skin & soft tissue infections'],
    precautions: [
      'Strictly complete the full course prescribed by your physician even if feeling better.',
      'Do not take if you have a known penicillin allergy.',
      'Take with food to minimize gastric upset.'
    ],
    sideEffects: ['Diarrhea or loose stools', 'Mild nausea', 'Skin rash (stop and contact doctor immediately)'],
    dosageGuidelines: 'As directed by physician. Commonly 1 tablet every 8 to 12 hours.',
    verifiedSource: 'WHO Model List of Essential Medicines',
  },
  'metformin': {
    name: 'Metformin / Glycomet',
    genericName: 'Metformin Hydrochloride',
    strength: '500mg / 1000mg',
    category: 'Biguanide Antidiabetic',
    manufacturer: 'USV / Sun Pharma',
    indications: ['Type 2 Diabetes Mellitus glycemic management', 'Insulin resistance management'],
    precautions: [
      'Always take with meals to reduce gastrointestinal side effects.',
      'Temporarily withhold prior to radiographic iodinated contrast studies.',
      'Monitor renal function periodically.'
    ],
    sideEffects: ['Abdominal bloating', 'Metallic taste', 'Mild loose stools during first week'],
    dosageGuidelines: 'Start with low dose (500mg OD) with evening meal; physician titrates gradually.',
    verifiedSource: 'CDSCO Approved Prescribing Information',
  },
  'pantoprazole': {
    name: 'Pantoprazole / Pan-40',
    genericName: 'Pantoprazole Sodium',
    strength: '40mg',
    category: 'Proton Pump Inhibitor (PPI)',
    manufacturer: 'Alkem / Cipla',
    indications: ['Gastroesophageal Reflux Disease (GERD)', 'Peptic ulcer disease', 'Gastric protection with NSAIDs'],
    precautions: [
      'Swallow tablet whole; do not crush or chew.',
      'Optimal efficacy when ingested 30 minutes before first meal of the day.',
      'Prolonged unmonitored usage (>1 year) should be evaluated by a gastroenterologist.'
    ],
    sideEffects: ['Headache', 'Mild constipation or diarrhea', 'Flatulence'],
    dosageGuidelines: '1 tablet once daily in the morning, 30 minutes before breakfast.',
    verifiedSource: 'Central Drugs Standard Control Organisation (CDSCO)',
  }
};
