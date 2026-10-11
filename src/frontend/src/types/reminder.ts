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

  // SMS Medication Reminder fields
  dosage?: string;
  frequency?: string;
  phoneNumber?: string;
  recipientName?: string;
  smsEnabled?: boolean;
  smsConsent?: boolean;
  smsStatus?: 'scheduled' | 'sent' | 'failed' | 'disabled';
  smsSentAt?: string;
  smsError?: string;
}

export interface SmsDispatchResult {
  success: boolean;
  message: string;
  reminderId: string;
  smsStatus: 'scheduled' | 'sent' | 'failed';
  messageId?: string;
  recipientMasked?: string;
  smsBody?: string;
  error?: string;
  trialMode?: boolean;
  templateName?: string;
}

export interface SmsConfigInfo {
  provider: string;
  devMode: boolean;
  isConfigured: boolean;
  maskedTwilioNumber?: string;
  trialMode?: boolean;
  templateName?: string;
}
