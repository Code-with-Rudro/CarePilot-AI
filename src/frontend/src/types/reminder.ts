export interface MedicationReminder {
  id: string;
  medicationName: string;
  strength: string;
  scheduledTime: string; // e.g. "08:00 AM"
  slot: 'morning' | 'afternoon' | 'evening' | 'night';
  timingWithFood: string; // "After breakfast"
  status: 'pending' | 'taken' | 'skipped' | 'snoozed';
  takenAt?: string;
  adherenceRate?: number;
}
