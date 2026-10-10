import React, { useState } from 'react';

import { PrescriptionCard } from './prescription-card';

import {
  Prescription,
  MedicationInstruction,
} from '../../types/prescription';

import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';

import {
  Pill,
  Sparkles,
  ExternalLink,
  Info,
  Volume2,
} from 'lucide-react';

import { generateSpeech } from '../../lib/tts';

// Unity AR integration
const UNITY_AR_URL = import.meta.env.VITE_UNITY_AR_URL || '';

interface PrescriptionViewProps {
  prescriptions: Prescription[];
  onScheduleReminder?: (med: MedicationInstruction) => void;
  onVerifyMedication?: (medId: string) => void;
  onLaunchARAssistant?: () => void;
}

export const PrescriptionView: React.FC<PrescriptionViewProps> = ({
  prescriptions,
  onScheduleReminder,
  onVerifyMedication,
  onLaunchARAssistant,
}) => {
  const [unityLaunched, setUnityLaunched] = useState(false);

  // TTS states
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  // Generate speech for verified medications
  const handleListenToInstructions = async () => {
    setTtsError(null);
    setAudioUrl(null);

    setIsGeneratingAudio(true);

    try {
      const verifiedInstructions = prescriptions
        .flatMap((rx) => rx.medications)
        .filter((med) => med.confirmed)
        .map((med) => {
          return `${med.name}, strength ${med.strength}, instructions: ${med.timing}`;
        });

      if (verifiedInstructions.length === 0) {
        throw new Error(
          'No verified medications available. Please verify a medication first.'
        );
      }

      const text =
        'CarePilot medication instructions. ' +
        verifiedInstructions.join('. ');

      const url = await generateSpeech(text);

      if (!url) {
        throw new Error('No audio URL was returned by the TTS service.');
      }

      setAudioUrl(url);
    } catch (error) {
      setTtsError(
        error instanceof Error
          ? error.message
          : 'Unable to generate speech. Please try again.'
      );
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Open external Unity AR application
  const handleOpenUnity = () => {
    if (!UNITY_AR_URL) {
      return;
    }

    try {
      const parsedUrl = new URL(UNITY_AR_URL);

      if (
        parsedUrl.protocol !== 'https:' &&
        parsedUrl.protocol !== 'http:'
      ) {
        setTtsError(null);
        return;
      }

      window.open(
        parsedUrl.href,
        '_blank',
        'noopener,noreferrer'
      );

      setUnityLaunched(true);
    } catch {
      setUnityLaunched(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Medication safety advisory */}
      <Alert
        type="attention"
        title="Medication Safety Advisory"
      >
        Prescription schedules are extracted from doctor slips.
        Never change, start, or stop medication dosages without
        qualified clinician guidance. Unclear instructions must
        be verified before relying on them.
      </Alert>

      {/* Text-to-Speech section */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
          padding: '1.25rem',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Volume2 size={21} />
          </div>

          <div>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                margin: 0,
              }}
            >
              Listen to Medication Instructions
            </h3>

            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-muted)',
                marginTop: '0.25rem',
              }}
            >
              Listen to your verified prescription details.
            </p>
          </div>
        </div>

        <Button
          id="listen-to-instructions"
          onClick={handleListenToInstructions}
          disabled={isGeneratingAudio}
          leftIcon={<Volume2 size={16} />}
        >
          {isGeneratingAudio
            ? 'Generating Audio...'
            : 'Listen to Instructions'}
        </Button>

        {ttsError && (
          <Alert
            type="attention"
            title="Speech Generation Failed"
          >
            {ttsError}
          </Alert>
        )}

        {audioUrl && (
          <div>
            <p
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--color-text-main)',
                marginBottom: '0.5rem',
              }}
            >
              Audio generated successfully
            </p>

            <audio
              controls
              src={audioUrl}
              style={{
                width: '100%',
              }}
              onError={() => {
                setTtsError(
                  'Audio playback failed. Please check the audio URL and try again.'
                );
              }}
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        )}
      </section>

      {/* AR Medicine Assistant */}
      <section
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
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
            <div
              style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'var(--color-text-main)',
              }}
            >
              AR Medicine Assistant
            </div>

            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
              }}
            >
              Scan medicine packaging for verified drug information.
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            flexWrap: 'wrap',
          }}
        >
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
              Unity AR integration pending.
            </div>
          )}
        </div>
      </section>

      {unityLaunched && (
        <Alert type="info">
          Unity AR application launch was requested.
          Return here when you are done.
        </Alert>
      )}

      {/* Prescription cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {prescriptions.map((rx) => (
          <PrescriptionCard
            key={rx.id}
            prescription={rx}
            onScheduleReminder={onScheduleReminder}
            onVerifyMedication={onVerifyMedication}
          />
        ))}

        {prescriptions.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '3.5rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--color-border)',
            }}
          >
            <Pill
              size={36}
              color="var(--color-text-muted)"
              style={{
                margin: '0 auto 0.75rem',
              }}
            />

            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--color-text-main)',
              }}
            >
              No active prescriptions on file
            </h3>

            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                marginTop: '0.25rem',
              }}
            >
              Upload a doctor prescription scan or photo to
              extract medication timings and explanations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionView;