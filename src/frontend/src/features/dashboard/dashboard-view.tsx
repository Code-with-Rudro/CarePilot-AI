import React from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert } from '../../components/ui/alert';
import { useAuth } from '../../hooks/use-auth';
import { MedicalDocument } from '../../types/document';
import { ExtractedField, HealthFact } from '../../types/extraction';
import { MedicationReminder } from '../../types/reminder';
import { formatDate } from '../../lib/formatters';
import { 
  Upload, 
  Bot, 
  Sparkles, 
  ShieldAlert, 
  FileText, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Bell
} from 'lucide-react';

interface DashboardViewProps {
  documents: MedicalDocument[];
  extractedFields: ExtractedField[];
  healthFacts: HealthFact[];
  reminders: MedicationReminder[];
  onNavigate: (screenId: string) => void;
  onOpenUpload: () => void;
  onSelectDocument: (doc: MedicalDocument) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  extractedFields,
  healthFacts,
  reminders,
  onNavigate,
  onOpenUpload,
  onSelectDocument,
}) => {
  const { currentUser } = useAuth();

  const unverifiedFields = extractedFields.filter(f => f.reviewStatus === 'unverified');
  const abnormalFacts = healthFacts.filter(f => f.isOutOfRange);
  const pendingReminders = reminders.filter(r => r.status === 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--color-surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Altrix Labs Health Copilot
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
            Hello, {currentUser.name} 👋
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Your healthcare information, verified records, and medication reminders at a glance.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="secondary"
            onClick={() => onNavigate('ar-assistant')}
            leftIcon={<Sparkles size={16} />}
          >
            AR Medicine Scan
          </Button>
          <Button
            variant="primary"
            onClick={onOpenUpload}
            leftIcon={<Upload size={16} />}
          >
            Upload Medical Record
          </Button>
        </div>
      </div>

      {/* Needs Your Attention Alert if unverified extractions exist */}
      {unverifiedFields.length > 0 && (
        <Alert
          type="attention"
          title={`Needs Your Attention: ${unverifiedFields.length} Unverified Extraction Parameter${unverifiedFields.length > 1 ? 's' : ''}`}
          action={
            <Button size="sm" variant="outline" onClick={() => onNavigate('extraction-review')}>
              Review Now
            </Button>
          }
        >
          Some medical values extracted via OCR from your recent prescription/report have moderate confidence. Confirm or correct them to update your health timeline safely.
        </Alert>
      )}

      {/* Key Metric Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
        <Card hoverable onClick={() => onNavigate('documents')} style={{ cursor: 'pointer', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
              Medical Records
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '0.5rem' }}>
            {documents.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Latest: {formatDate(documents[0]?.documentDate)}
          </span>
        </Card>

        <Card hoverable onClick={() => onNavigate('extraction-review')} style={{ cursor: 'pointer', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
              Extracted Parameters
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '0.5rem' }}>
            {extractedFields.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: unverifiedFields.length > 0 ? 'var(--color-attention)' : 'var(--color-success)', fontWeight: 500 }}>
            {unverifiedFields.length > 0 ? `${unverifiedFields.length} need verification` : 'All verified'}
          </span>
        </Card>

        <Card hoverable onClick={() => onNavigate('health-timeline')} style={{ cursor: 'pointer', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
              Clinical Findings
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-critical-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-critical)' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-critical)', marginTop: '0.5rem' }}>
            {abnormalFacts.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Outside standard lab intervals
          </span>
        </Card>

        <Card hoverable onClick={() => onNavigate('reminders')} style={{ cursor: 'pointer', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
              Today's Reminders
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-info)' }}>
              <Bell size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '0.5rem' }}>
            {reminders.length - pendingReminders.length} / {reminders.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {pendingReminders.length} pending dosage{pendingReminders.length !== 1 ? 's' : ''}
          </span>
        </Card>
      </div>

      {/* Two Column Section: Recent Records & Copilot Teaser */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Left: Recent Records */}
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Recent Medical Documents
            </h3>
            <button
              onClick={() => onNavigate('documents')}
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              View All ({documents.length}) <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {documents.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.875rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={18} color="var(--color-primary)" />
                  <div>
                    <h5 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      {doc.filename}
                    </h5>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {formatDate(doc.documentDate)} • {doc.facilityOrDoctor}
                    </span>
                  </div>
                </div>

                <Badge variant={doc.status === 'processed' ? 'success' : 'attention'} size="sm">
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: AI Health Copilot Quick Start */}
        <Card style={{ padding: '1.5rem', backgroundColor: 'var(--color-accent)', border: '1px solid rgba(23, 107, 102, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Bot size={22} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
              Ask Health Copilot
            </h3>
            <Badge variant="info" size="sm">RAG Grounded</Badge>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', lineHeight: 1.5, marginBottom: '1rem' }}>
            Have questions about your diagnostic reports or medication instructions? Copilot searches your authorized records and provides plain-language explanations with exact source citations.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {[
              'What does my Haemoglobin level say?',
              'How should I take Metoprolol Tartrate?',
              'Explain my HbA1c test result in plain words',
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate('copilot')}
                style={{
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-primary-dark)',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{q}</span>
                <ArrowRight size={13} color="var(--color-text-muted)" />
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            onClick={() => onNavigate('copilot')}
            rightIcon={<ArrowRight size={15} />}
          >
            Open Full Health Copilot
          </Button>
        </Card>
      </div>
    </div>
  );
};
