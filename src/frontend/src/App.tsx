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
import { ChatView } from './features/copilot/chat-view';
import { CopilotFab } from './features/copilot/copilot-fab';
import { useSession } from './features/auth/session-context';
import { AppScreen, APP_ROUTES } from './app/routes';
import { apiClient } from './lib/api-client';
import { MedicalDocument } from './types/document';
import { ExtractedField, HealthFact, ReviewStatus } from './types/extraction';
import { Prescription } from './types/prescription';
import { MedicationReminder } from './types/reminder';

const getInitialScreen = (): AppScreen => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen') as AppScreen | null;
    if (screenParam && screenParam in APP_ROUTES) return screenParam;

    const hash = window.location.hash.replace(/^#\/?/, '') as AppScreen;
    if (hash && hash in APP_ROUTES) return hash;

    const path = window.location.pathname.replace(/^\//, '') as AppScreen;
    if (path && path in APP_ROUTES) return path;
  }
  return 'dashboard';
};

/**
 * App.tsx — Top-level composition root.
 *
 * In local development (import.meta.env.DEV), login sessions are automatically
 * bypassed so developers can directly interact with the dashboard, copilot,
 * TTS, STT, and all clinical tools without manual sign-in.
 */
export const App: React.FC = () => {
  const { currentUser, isAuthenticated } = useSession();

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(getInitialScreen);
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

  const handleCreateReminder = async (
    name: string,
    strength: string,
    time: string,
    foodTiming: string,
    dosage?: string,
    frequency?: string,
    phoneNumber?: string,
    smsEnabled?: boolean,
    smsConsent?: boolean
  ) => {
    const newRem = await apiClient.createReminder({
      medicationName: name,
      strength,
      scheduledTime: time,
      slot: 'morning',
      timingWithFood: foodTiming,
      dosage: dosage || strength,
      frequency: frequency || 'Once daily',
      phoneNumber: phoneNumber || currentUser?.emergencyContact || '+91 98765 43210',
      recipientName: currentUser?.name || 'Valued Patient',
      smsEnabled: smsEnabled ?? true,
      smsConsent: smsConsent ?? false,
    });
    setReminders(prev => [...prev, newRem]);
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await apiClient.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete reminder', err);
    }
  };

  const handleVerifyMedication = (medId: string) => {
    setPrescriptions(prev => prev.map(rx => ({
      ...rx,
      medications: rx.medications.map(m => m.id === medId ? { ...m, confirmed: true } : m),
    })));
  };

  const handleDeletePrescription = async (rxId: string) => {
    await apiClient.deletePrescription(rxId);
    setPrescriptions((prev) => prev.filter((rx) => rx.id !== rxId));
    try {
      const docs = await apiClient.getDocuments();
      setDocuments(docs);
    } catch {
      // ignore
    }
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
              handleCreateReminder(
                med.name,
                med.strength,
                '08:00 AM',
                med.timing,
                med.dosage || med.strength,
                med.frequency || 'Once daily',
                currentUser?.emergencyContact || '+91 98765 43210',
                true,
                true
              );
              setCurrentScreen('reminders');
            }}
            onVerifyMedication={handleVerifyMedication}
            onUpdateMedication={async (rxId, medId, updates) => {
              await apiClient.updateMedication(rxId, medId, updates);
              setPrescriptions((prev) =>
                prev.map((rx) =>
                  rx.id === rxId
                    ? {
                        ...rx,
                        medications: rx.medications.map((m) =>
                          m.id === medId ? { ...m, ...updates } : m
                        ),
                      }
                    : rx
                )
              );
            }}
            onDeletePrescription={handleDeletePrescription}
            onUploadPrescription={async (file) => {
              const newRx = await apiClient.uploadPrescriptionImage(file);
              setPrescriptions((prev) => [newRx, ...prev]);
            }}
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
            onDeleteReminder={handleDeleteReminder}
            onCreateReminder={handleCreateReminder}
          />
        );

      case 'ar-assistant':
        return <CameraScannerOverlay />;

      case 'settings-privacy':
        return <SettingsView />;

      case 'copilot':
        return (
          <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
            <ChatView
              onOpenDocument={(docId) => {
                const d = documents.find(doc => doc.id === docId);
                if (d) setSelectedDocForViewer(d);
              }}
            />
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
