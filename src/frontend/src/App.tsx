import React, { useState, useEffect } from 'react';
import { Shell } from './components/layout/shell';
import { DashboardView } from './features/dashboard/dashboard-view';
import { DocumentList } from './features/documents/document-list';
import { DocumentViewer } from './features/documents/document-viewer';
import { ReviewView } from './features/extraction-review/review-view';
import { PrescriptionView } from './features/prescriptions/prescription-view';
import { TimelineView } from './features/health-timeline/timeline-view';
import { CameraScannerOverlay } from './features/ar-assistant/camera-scanner-overlay';
import { RemindersView } from './features/reminders/reminders-view';
import { SettingsView } from './features/settings-privacy/settings-view';
import { UploadModal } from './features/documents/upload-modal';
import { LoginView } from './features/auth/login-view';
import { CopilotFab } from './features/copilot/copilot-fab';
import { useSession } from './features/auth/session-context';
import { AppScreen, APP_ROUTES } from './app/routes';
import { apiClient } from './lib/api-client';
import { MedicalDocument } from './types/document';
import { ExtractedField, HealthFact, ReviewStatus } from './types/extraction';
import { Prescription } from './types/prescription';
import { MedicationReminder } from './types/reminder';

/**
 * App.tsx — Top-level composition root.
 *
 * Change 1: The AI Health Copilot (ChatView) is no longer a primary nav
 *   item. It is surfaced via CopilotFab on all authenticated pages.
 * Change 3: AR Medicine Assistant is no longer a primary nav item. The
 *   "Open AR Medicine Assistant" button lives inside PrescriptionView.
 *   Clicking it navigates to 'ar-assistant' which renders the full scanner.
 */
export const App: React.FC = () => {
  const { isAuthenticated } = useSession();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('dashboard');
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [healthFacts, setHealthFacts] = useState<HealthFact[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<MedicalDocument | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Initial data load from ApiClient
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadInitialData = async () => {
      const [docs, fields, facts, rxs, rems] = await Promise.all([
        apiClient.getDocuments(),
        apiClient.getExtractedFields(),
        apiClient.getHealthFacts(),
        apiClient.getPrescriptions(),
        apiClient.getReminders(),
      ]);
      setDocuments(docs);
      setExtractedFields(fields);
      setHealthFacts(facts);
      setPrescriptions(rxs);
      setReminders(rems);
    };
    loadInitialData();
  }, [isAuthenticated]);

  // Show login screen when unauthenticated
  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleUpdateField = async (fieldId: string, status: ReviewStatus, correctedVal?: string) => {
    const updated = await apiClient.updateExtractedField(fieldId, status, correctedVal);
    if (updated) {
      setExtractedFields(prev => prev.map(f => f.id === fieldId ? updated : f));
      const facts = await apiClient.getHealthFacts();
      setHealthFacts(facts);
    }
  };

  const handleUpdateReminder = async (id: string, status: 'taken' | 'skipped' | 'snoozed') => {
    const updated = await apiClient.updateReminderStatus(id, status);
    if (updated) {
      setReminders(prev => prev.map(r => r.id === id ? updated : r));
    }
  };

  const handleCreateReminder = async (name: string, strength: string, time: string, foodTiming: string) => {
    const newRem = await apiClient.createReminder({
      medicationName: name,
      strength,
      scheduledTime: time,
      slot: 'morning',
      timingWithFood: foodTiming,
    });
    setReminders(prev => [...prev, newRem]);
  };

  const handleVerifyMedication = (medId: string) => {
    setPrescriptions(prev => prev.map(rx => ({
      ...rx,
      medications: rx.medications.map(m => m.id === medId ? { ...m, confirmed: true } : m),
    })));
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardView
            documents={documents}
            extractedFields={extractedFields}
            healthFacts={healthFacts}
            reminders={reminders}
            onNavigate={(screen) => setCurrentScreen(screen as AppScreen)}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onSelectDocument={(doc) => setSelectedDocForViewer(doc)}
          />
        );

      case 'documents':
        return (
          <DocumentList
            extractedFields={extractedFields}
            onNavigateToReview={() => setCurrentScreen('extraction-review')}
            onAskCopilot={() => {
              // Copilot is now the FAB — show a tip; the FAB button is always present
            }}
          />
        );

      case 'extraction-review':
        return (
          <ReviewView
            fields={extractedFields}
            onUpdateField={handleUpdateField}
            onNavigateToTimeline={() => setCurrentScreen('health-timeline')}
          />
        );

      case 'prescriptions':
        return (
          <PrescriptionView
            prescriptions={prescriptions}
            onScheduleReminder={(med) => {
              handleCreateReminder(med.name, med.strength, '08:00 AM', med.timing);
              setCurrentScreen('reminders');
            }}
            onVerifyMedication={handleVerifyMedication}
            onLaunchARAssistant={() => setCurrentScreen('ar-assistant')}
          />
        );

      case 'health-timeline':
        return (
          <TimelineView
            healthFacts={healthFacts}
            documents={documents}
            onSelectDocument={(doc) => setSelectedDocForViewer(doc)}
          />
        );

      case 'reminders':
        return (
          <RemindersView
            reminders={reminders}
            onUpdateStatus={handleUpdateReminder}
            onCreateReminder={handleCreateReminder}
          />
        );

      case 'ar-assistant':
        return <CameraScannerOverlay />;

      case 'settings-privacy':
        return <SettingsView />;

      // 'copilot' route kept in the type system for deep-link compatibility,
      // but the primary entry point is now the floating FAB.
      case 'copilot':
        return (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <p>Use the <strong>Health Copilot</strong> button (bottom-right corner) to open the assistant.</p>
          </div>
        );

      default:
        return (
          <DashboardView
            documents={documents}
            extractedFields={extractedFields}
            healthFacts={healthFacts}
            reminders={reminders}
            onNavigate={(screen) => setCurrentScreen(screen as AppScreen)}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onSelectDocument={(doc) => setSelectedDocForViewer(doc)}
          />
        );
    }
  };

  const pageTitle = APP_ROUTES[currentScreen]?.title || 'CarePilot AI';

  return (
    <Shell
      activeScreen={currentScreen}
      onNavigate={(screen) => setCurrentScreen(screen as AppScreen)}
      pageTitle={pageTitle}
    >
      {renderActiveScreen()}

      <DocumentViewer
        document={selectedDocForViewer}
        extractedFields={extractedFields}
        onClose={() => setSelectedDocForViewer(null)}
        onNavigateToReview={() => {
          setSelectedDocForViewer(null);
          setCurrentScreen('extraction-review');
        }}
        onAskCopilotAboutDoc={(_fname) => {
          setSelectedDocForViewer(null);
          // The copilot FAB handles all chat — just close the viewer
        }}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={async (file, docType, facility) => {
          await apiClient.uploadDocument(file, docType, facility);
          const [docs, fields] = await Promise.all([
            apiClient.getDocuments(),
            apiClient.getExtractedFields(),
          ]);
          setDocuments(docs);
          setExtractedFields(fields);
          setIsUploadModalOpen(false);
          setCurrentScreen('extraction-review');
        }}
      />

      {/* Change 1: Floating Health Copilot — visible on all authenticated pages */}
      <CopilotFab
        onOpenDocument={(docId) => {
          const d = documents.find(doc => doc.id === docId);
          if (d) setSelectedDocForViewer(d);
        }}
      />
    </Shell>
  );
};

export default App;
