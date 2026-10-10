import React, { useState } from 'react';
import { useCamera } from '../../hooks/use-camera';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert } from '../../components/ui/alert';
import { MedicineInfoPanel } from './medicine-info-panel';
import { apiClient } from '../../lib/api-client';
import { VerifiedMedicineInfo } from '../../lib/constants';
import { Camera, Scan, CheckCircle2, RotateCw, ExternalLink, Sparkles, HelpCircle } from 'lucide-react';

export const CameraScannerOverlay: React.FC = () => {
  const { videoRef, stream, hasPermission, isStarting, errorMessage, startCamera, stopCamera } = useCamera();
  const [detectedCandidate, setDetectedCandidate] = useState<{ name: string; strength: string; confidence: number } | null>(null);
  const [confirmedMedicine, setConfirmedMedicine] = useState<VerifiedMedicineInfo | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Demo sample package selector
  const demoPackages = [
    { label: 'Paracetamol / Dolo 650mg', query: 'paracetamol', strength: '650mg' },
    { label: 'Amoxicillin / Augmentin 625mg', query: 'amoxicillin', strength: '625mg' },
    { label: 'Metformin / Glycomet 500mg', query: 'metformin', strength: '500mg' },
    { label: 'Pantoprazole / Pan-40', query: 'pantoprazole', strength: '40mg' },
  ];

  const handleSimulateScan = async (query: string, strength: string) => {
    setIsScanning(true);
    setDetectedCandidate(null);
    setConfirmedMedicine(null);

    // Simulate OCR detection latency
    setTimeout(async () => {
      setDetectedCandidate({
        name: query.toUpperCase(),
        strength: strength,
        confidence: 0.96,
      });
      setIsScanning(false);
    }, 1000);
  };

  const handleConfirmCandidate = async () => {
    if (!detectedCandidate) return;
    const info = await apiClient.lookupMedicine(detectedCandidate.name);
    setConfirmedMedicine(info);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner explaining AR & Unity external bridge status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--color-surface)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
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
            <Sparkles size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
              AI-Powered AR Medicine Scanner & Assistant
            </h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Live camera package OCR recognition with verified medicine reference intelligence
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant="info">Unity Integration: Contract Ready</Badge>
          <Badge variant="success">Web AR Overlay Active</Badge>
        </div>
      </div>

      {/* Main Viewport Grid: Camera / Scanner on left, AR floating panel on right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Camera Feed / Overlay Box */}
        <div
          style={{
            position: 'relative',
            backgroundColor: '#0F172A',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            minHeight: '380px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-lg)',
            border: '2px solid var(--color-border)',
          }}
        >
          {/* Active video stream if enabled */}
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                gap: '0.75rem',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <Camera size={44} strokeWidth={1.5} />
              <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                {isStarting ? 'Accessing camera device...' : 'Camera stream is idle. Start camera or select a demo sample.'}
              </p>
              {errorMessage && (
                <span style={{ fontSize: '0.75rem', color: '#F87171' }}>{errorMessage}</span>
              )}
            </div>
          )}

          {/* AR Target Reticle Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '260px',
                height: '180px',
                border: `2px dashed ${isScanning ? '#F59E0B' : '#10B981'}`,
                borderRadius: 'var(--radius-lg)',
                boxShadow: isScanning ? '0 0 20px rgba(245, 158, 11, 0.4)' : '0 0 20px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.15)',
              }}
            >
              <span style={{ color: '#ffffff', fontSize: '0.75rem', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                {isScanning ? 'Analyzing OCR bounding box...' : 'Align medicine blister or box here'}
              </span>
            </div>
          </div>

          {/* Bottom Scanner Toolbar */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              margin: 'auto 0 0 0',
              padding: '1rem',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {!stream ? (
                <Button size="sm" variant="primary" onClick={startCamera} leftIcon={<Camera size={14} />}>
                  Enable Camera
                </Button>
              ) : (
                <Button size="sm" variant="danger" onClick={stopCamera}>
                  Stop Camera
                </Button>
              )}
            </div>

            {/* Quick Demo Sample Package Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ fontSize: '0.6875rem', color: '#94A3B8', marginRight: '0.25rem' }}>
                Quick Samples:
              </span>
              {demoPackages.map((dp, i) => (
                <button
                  key={i}
                  onClick={() => handleSimulateScan(dp.query, dp.strength)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  {dp.label.split('/')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Detection Confirmation & Verified AR Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Candidate Detection Notification Card */}
          {detectedCandidate && !confirmedMedicine && (
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '2px solid var(--color-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-md)',
                animation: 'fadeIn var(--transition-fast) ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Scan size={18} color="var(--color-primary)" />
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  Detected Medicine Candidate
                </h4>
                <Badge variant="attention">Needs Confirmation</Badge>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                Camera OCR extracted candidate: <strong>{detectedCandidate.name} ({detectedCandidate.strength})</strong>.
                Per healthcare safety rules, please confirm this matches your actual package.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleConfirmCandidate}
                  leftIcon={<CheckCircle2 size={15} />}
                >
                  Confirm & View Medicine Guide
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDetectedCandidate(null)}
                >
                  Rescan
                </Button>
              </div>
            </div>
          )}

          {/* Confirmed AR Information Panel */}
          {confirmedMedicine ? (
            <MedicineInfoPanel
              medicine={confirmedMedicine}
              onClose={() => setConfirmedMedicine(null)}
            />
          ) : !detectedCandidate && (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--color-border)',
              }}
            >
              <Scan size={36} color="var(--color-text-muted)" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                Point Camera at Medicine Package
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', maxWidth: '320px' }}>
                Align the packaging label inside the reticle or click one of the quick samples below the camera to preview instant identification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
