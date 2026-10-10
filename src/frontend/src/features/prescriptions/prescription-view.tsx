import React, { useState } from 'react';
import { PrescriptionCard } from './prescription-card';
import { Prescription, MedicationInstruction } from '../../types/prescription';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Pill, Sparkles, ExternalLink, Info } from 'lucide-react';

/**
 * UNITY INTEGRATION STATUS (Change 3):
 *
 * The Unity AR Medicine application is externally developed by Sai (Workstream H).
 * The unity_integration_guide.md file is currently EMPTY — no URL, endpoint,
 * callback protocol, or authentication mechanism has been documented.
 *
 * Implementation decision:
 *   - The "Open AR Medicine Assistant" button is present and functional.
 *   - It navigates to the internal AR scanner overlay (web-based OCR, not Unity).
 *   - A second "Open Unity AR (External)" button placeholder is shown with a
 *     clearly-configured integration point (UNITY_AR_URL constant below).
 *   - When UNITY_AR_URL is set (by the Unity team via environment variable or
 *     team agreement), the button will open the Unity experience in a new tab.
 *   - Until then, the button shows an honest "Integration Pending" state.
 *
 * MISSING DEPENDENCY: Sai / Workstream H must provide:
 *   - The deployed Unity AR URL (or launch mechanism).
 *   - Any authentication handshake required.
 *   - The agreed data callback / postMessage protocol and allowed origins.
 *   Set VITE_UNITY_AR_URL in the .env file once the contract is agreed.
 */
const UNITY_AR_URL = import.meta.env.VITE_UNITY_AR_URL || '';

interface PrescriptionViewProps {
  prescriptions: Prescription[];
  onScheduleReminder?: (med: MedicationInstruction) => void;
  onVerifyMedication?: (medId: string) => void;
  /** Navigates to the web-based AR scanner overlay */
  onLaunchARAssistant?: () => void;
}

export const PrescriptionView: React.FC<PrescriptionViewProps> = ({
  prescriptions,
  onScheduleReminder,
  onVerifyMedication,
  onLaunchARAssistant,
}) => {
  const [unityLaunched, setUnityLaunched] = useState(false);

  const handleOpenUnity = () => {
    if (!UNITY_AR_URL) return;
    // Validate: only open URLs that are explicitly configured by the team
    try {
      const parsed = new URL(UNITY_AR_URL);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return;
      window.open(UNITY_AR_URL, '_blank', 'noopener,noreferrer');
      setUnityLaunched(true);
    } catch {
      // Invalid URL in env — do nothing
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Alert type="attention" title="Medication Safety Advisory">
        Prescription schedules are extracted directly from doctor slips. Never alter, start, or stop prescription
        dosages without qualified clinician oversight. Ambiguous handwritten entries are clearly marked for your confirmation.
      </Alert>

      {/* Change 3: AR Medicine Assistant launch controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.875rem',
          padding: '1.125rem 1.25rem',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
              AR Medicine Assistant
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Scan medicine packaging for verified drug information
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {/* Web-based AR scanner — always available */}
          {onLaunchARAssistant && (
            <Button
              id="open-ar-web-scanner"
              variant="secondary"
              size="sm"
              onClick={onLaunchARAssistant}
              leftIcon={<Sparkles size={15} />}
            >
              Open AR Medicine Assistant
            </Button>
          )}

          {/* Unity external launcher — shows status based on env variable */}
          {UNITY_AR_URL ? (
            <Button
              id="open-unity-ar"
              variant="outline"
              size="sm"
              onClick={handleOpenUnity}
              leftIcon={<ExternalLink size={14} />}
            >
              Open Unity AR (External)
            </Button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--color-border)',
              }}
            >
              <Info size={13} />
              Unity AR: Integration contract pending (set VITE_UNITY_AR_URL)
            </div>
          )}
        </div>
      </div>

      {unityLaunched && (
        <Alert type="info">
          Unity AR application opened in a new tab. Return here when you are done — your prescription data is preserved.
        </Alert>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {prescriptions.map((rx) => (
          <PrescriptionCard
            key={rx.id}
            prescription={rx}
            onScheduleReminder={onScheduleReminder}
            onVerifyMedication={onVerifyMedication}
          />
        ))}

        {prescriptions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
            <Pill size={36} color="var(--color-text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
              No active prescriptions on file
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              Upload a doctor prescription scan or photo to extract medication timings and Telugu explanations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
