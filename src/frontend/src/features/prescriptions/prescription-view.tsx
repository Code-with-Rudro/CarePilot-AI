import React, { useRef, useState } from 'react';
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
  Upload,
  FileUp,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { generateSpeech, TTS_VOICES, TTSLanguage } from '../../lib/tts';
import { getHindiTranslation, getTeluguTranslation } from '../../lib/translations';

// Unity AR integration
const UNITY_AR_URL = import.meta.env.VITE_UNITY_AR_URL || '';

interface PrescriptionViewProps {
  prescriptions: Prescription[];
  onScheduleReminder?: (med: MedicationInstruction) => void;
  onVerifyMedication?: (medId: string) => void;
  onUpdateMedication?: (rxId: string, medId: string, updates: Partial<MedicationInstruction>) => void;
  onDeletePrescription?: (rxId: string) => Promise<void>;
  onUploadPrescription?: (file: File) => Promise<void>;
  onLaunchARAssistant?: () => void;
}

export const PrescriptionView: React.FC<PrescriptionViewProps> = ({
  prescriptions,
  onScheduleReminder,
  onVerifyMedication,
  onUpdateMedication,
  onDeletePrescription,
  onUploadPrescription,
  onLaunchARAssistant,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Upload and OCR processing states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('Analyzing prescription image with Clinical OCR & AI...');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessAlert, setUploadSuccessAlert] = useState<string | null>(null);

  const [unityLaunched, setUnityLaunched] = useState(false);

  // TTS states
  const [selectedLanguage, setSelectedLanguage] = useState<TTSLanguage>('english');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const handleLanguageChange = (lang: TTSLanguage) => {
    setSelectedLanguage(lang);
    setAudioUrl(null);
    setTtsError(null);
  };

  // Handle prescription image upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccessAlert(null);
    setIsUploading(true);
    setUploadProgressMsg('Uploading prescription image...');

    try {
      setTimeout(() => {
        setUploadProgressMsg('Running Optical Character Recognition (OCR) on prescription slip...');
      }, 700);

      setTimeout(() => {
        setUploadProgressMsg('Extracting doctor details, medication names, dosages, and schedules...');
      }, 1500);

      if (onUploadPrescription) {
        await onUploadPrescription(file);
      }

      setUploadSuccessAlert(`Successfully processed "${file.name}"! Extracted medicine details are ready for review.`);
      setTimeout(() => setUploadSuccessAlert(null), 6000);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process prescription image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Generate speech for verified medications
  const handleListenToInstructions = async () => {
    setTtsError(null);
    setAudioUrl(null);
    setIsGeneratingAudio(true);

    try {
      const verifiedMeds = prescriptions
        .flatMap((rx) => rx.medications)
        .filter((med) => med.confirmed);

      if (verifiedMeds.length === 0) {
        throw new Error(
          'No verified medications available. Please review and confirm a medication first.'
        );
      }

      let text = '';
      let voiceId = TTS_VOICES.english;

      if (selectedLanguage === 'telugu') {
        const teluguLines = verifiedMeds.map((med) => {
          const t = getTeluguTranslation(med.instructionsEnglish, med.instructionsTelugu);
          return `${med.name}, సూచనలు: ${t}`;
        });
        text = 'కేర్‌పైలట్ మందుల సూచనలు. ' + teluguLines.join('. ');
        voiceId = TTS_VOICES.telugu;
      } else if (selectedLanguage === 'hindi') {
        const hindiLines = verifiedMeds.map((med) => {
          const h = getHindiTranslation(med.instructionsEnglish, med.instructionsHindi);
          return `${med.name}, निर्देश: ${h}`;
        });
        text = 'केयरपायलट दवा निर्देश। ' + hindiLines.join('. ');
        voiceId = TTS_VOICES.hindi;
      } else {
        const englishLines = verifiedMeds.map((med) => {
          return `${med.name}, strength ${med.strength}, instructions: ${med.timing}. ${med.instructionsEnglish}`;
        });
        text = 'CarePilot medication instructions. ' + englishLines.join('. ');
        voiceId = TTS_VOICES.english;
      }

      const url = await generateSpeech(text, voiceId);
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

  const handleOpenUnity = () => {
    if (!UNITY_AR_URL) return;
    try {
      const parsedUrl = new URL(UNITY_AR_URL);
      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') return;
      window.open(parsedUrl.href, '_blank', 'noopener,noreferrer');
      setUnityLaunched(true);
    } catch {
      setUnityLaunched(false);
    }
  };

  const hasPrescriptions = prescriptions.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hidden file input for Upload Record button */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/jpg,application/pdf"
        style={{ display: 'none' }}
      />

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Pill size={24} color="var(--color-primary)" />
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--color-text-main)',
                margin: 0,
              }}
            >
              Prescriptions & Medications
            </h1>
          </div>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              marginTop: '0.25rem',
            }}
          >
            Manage prescriptions, verified medicine dosages, and multi-language audio explanations.
          </p>
        </div>

        <Button
          id="upload-record-btn"
          variant="primary"
          size="md"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          leftIcon={<Upload size={18} />}
        >
          Upload Record
        </Button>
      </div>

      {/* Medication Safety Advisory */}
      <Alert type="attention" title="Medication Safety Advisory">
        Prescription schedules are extracted from doctor slips. Never change, start, or stop medication dosages
        without qualified clinician guidance. Unclear instructions must be verified before relying on them.
      </Alert>

      {/* Processing / Loading Indicator */}
      {isUploading && (
        <div
          style={{
            padding: '2.5rem 1.5rem',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'spin 1.5s linear infinite',
            }}
          >
            <Loader2 size={26} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>
              Analyzing Prescription Image...
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-primary)', marginTop: '0.35rem', fontWeight: 500 }}>
              {uploadProgressMsg}
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Reading medication names, strengths, timings, and frequency via Clinical Extraction.
            </span>
          </div>
        </div>
      )}

      {/* Upload Error Alert */}
      {uploadError && (
        <Alert type="critical">
          {uploadError}
        </Alert>
      )}

      {/* Upload Success Alert */}
      {uploadSuccessAlert && (
        <Alert type="success">
          <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '0.375rem' }} />
          {uploadSuccessAlert}
        </Alert>
      )}

      {/* ─── INITIAL EMPTY STATE (When no prescriptions uploaded yet) ─── */}
      {!hasPrescriptions && !isUploading && (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-hover, rgba(0, 0, 0, 0.04))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
            }}
          >
            <FileUp size={32} />
          </div>

          <div>
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                margin: 0,
              }}
            >
              No prescriptions uploaded yet. Upload a prescription image to get started.
            </h3>

            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                marginTop: '0.5rem',
                maxWidth: '520px',
                lineHeight: '1.5',
              }}
            >
              Upload a doctor slip or prescription photo to automatically extract medication names, dosage, timings, and multilingual explanations.
            </p>
          </div>

          <Button
            id="empty-state-upload-btn"
            variant="primary"
            size="md"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Upload size={18} />}
          >
            Upload Record
          </Button>
        </div>
      )}

      {/* ─── POPULATED STATE (Only visible after prescription is uploaded) ─── */}
      {hasPrescriptions && (
        <>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>
                  Listen to Medication Instructions
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  Listen to your verified prescription details in your preferred language.
                </p>
              </div>
            </div>

            {/* Language selector toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Language:
              </span>
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleLanguageChange('english')}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: selectedLanguage === 'english' ? 600 : 500,
                    backgroundColor: selectedLanguage === 'english' ? 'var(--color-primary)' : 'transparent',
                    color: selectedLanguage === 'english' ? '#ffffff' : 'var(--color-text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange('telugu')}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: selectedLanguage === 'telugu' ? 600 : 500,
                    backgroundColor: selectedLanguage === 'telugu' ? 'var(--color-primary)' : 'transparent',
                    color: selectedLanguage === 'telugu' ? '#ffffff' : 'var(--color-text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  తెలుగు (Telugu)
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange('hindi')}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: selectedLanguage === 'hindi' ? 600 : 500,
                    backgroundColor: selectedLanguage === 'hindi' ? 'var(--color-primary)' : 'transparent',
                    color: selectedLanguage === 'hindi' ? '#ffffff' : 'var(--color-text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  हिन्दी (Hindi)
                </button>
              </div>

              <Button
                id="listen-instructions-btn"
                variant="secondary"
                size="sm"
                onClick={handleListenToInstructions}
                isLoading={isGeneratingAudio}
                disabled={isGeneratingAudio}
                leftIcon={<Volume2 size={15} />}
              >
                Listen ({selectedLanguage === 'english' ? 'English' : selectedLanguage === 'telugu' ? 'తెలుగు' : 'हिन्दी'})
              </Button>
            </div>

            {ttsError && (
              <Alert type="critical">
                {ttsError}
              </Alert>
            )}

            {audioUrl && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <audio
                  id="prescription-audio-player"
                  src={audioUrl}
                  controls
                  autoPlay
                  style={{ width: '100%', height: '36px' }}
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
                  Scan medicine packaging for verified drug information.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
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
              Unity AR application launch was requested. Return here when you are done.
            </Alert>
          )}

          {/* Actual Extracted Prescription Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {prescriptions.map((rx) => (
              <PrescriptionCard
                key={rx.id}
                prescription={rx}
                onScheduleReminder={onScheduleReminder}
                onVerifyMedication={onVerifyMedication}
                onUpdateMedication={onUpdateMedication}
                onDeletePrescription={onDeletePrescription}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PrescriptionView;