export type AppScreen = 
  | 'dashboard' 
  | 'documents' 
  | 'extraction-review' 
  | 'prescriptions' 
  | 'health-timeline' 
  | 'copilot' 
  | 'reminders' 
  | 'ar-assistant' 
  | 'settings-privacy';

export interface RouteConfig {
  id: AppScreen;
  title: string;
  path: string;
}

export const APP_ROUTES: Record<AppScreen, RouteConfig> = {
  dashboard: {
    id: 'dashboard',
    title: 'Healthcare Overview',
    path: '/',
  },
  documents: {
    id: 'documents',
    title: 'My Medical Records',
    path: '/records',
  },
  'extraction-review': {
    id: 'extraction-review',
    title: 'Clinical Extraction Review',
    path: '/review',
  },
  prescriptions: {
    id: 'prescriptions',
    title: 'Prescriptions & Medications',
    path: '/prescriptions',
  },
  'health-timeline': {
    id: 'health-timeline',
    title: 'Reports & Diagnostic Trends',
    path: '/timeline',
  },
  copilot: {
    id: 'copilot',
    title: 'AI Health Copilot',
    path: '/copilot',
  },
  reminders: {
    id: 'reminders',
    title: 'Medication Reminders',
    path: '/reminders',
  },
  'ar-assistant': {
    id: 'ar-assistant',
    title: 'AR Medicine Assistant',
    path: '/ar-assistant',
  },
  'settings-privacy': {
    id: 'settings-privacy',
    title: 'Settings & Privacy Controls',
    path: '/settings',
  },
};
