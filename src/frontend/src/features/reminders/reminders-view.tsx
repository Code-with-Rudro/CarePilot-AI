import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert } from '../../components/ui/alert';
import { Modal } from '../../components/ui/modal';
import { Input } from '../../components/ui/input';
import { MedicationReminder, SmsConfigInfo, SmsDispatchResult } from '../../types/reminder';
import { 
  Bell, 
  Check, 
  Clock, 
  Plus, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Smartphone, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw,
  Info,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import { apiClient } from '../../lib/api-client';

interface RemindersViewProps {
  reminders: MedicationReminder[];
  onUpdateStatus: (id: string, status: 'taken' | 'skipped' | 'snoozed') => void;
  onDeleteReminder?: (id: string) => void;
  onCreateReminder?: (
    medicationName: string, 
    strength: string, 
    time: string, 
    timingFood: string,
    dosage?: string,
    frequency?: string,
    phoneNumber?: string,
    smsEnabled?: boolean,
    smsConsent?: boolean
  ) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  onUpdateStatus,
  onDeleteReminder,
  onCreateReminder,
}) => {
  const { currentUser } = useAuth();

  // Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [medName, setMedName] = useState('');
  const [strength, setStrength] = useState('25mg');
  const [dosage, setDosage] = useState('1 Tablet');
  const [time, setTime] = useState('08:00 AM');
  const [frequency, setFrequency] = useState('Once daily');
  const [foodTiming, setFoodTiming] = useState('After breakfast');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.emergencyContact || '+91 98765 43210');
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [smsConsent, setSmsConsent] = useState(true);

  // Status and feedback states
  const [smsStatusAlert, setSmsStatusAlert] = useState<{
    type: 'success' | 'attention' | 'critical' | 'info';
    message: string;
    details?: string;
  } | null>(null);
  const [isSendingSmsId, setIsSendingSmsId] = useState<string | null>(null);
  const [smsConfig, setSmsConfig] = useState<SmsConfigInfo>({
    provider: 'mock',
    devMode: true,
    isConfigured: true,
  });

  // Load backend SMS gateway configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
      const config = await apiClient.getSmsConfig();
      setSmsConfig(config);
    };
    fetchConfig();
  }, []);

  // Adherence Calculations
  const takenCount = reminders.filter(r => r.status === 'taken').length;
  const totalCount = reminders.length;
  const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  // Masking helper for privacy display
  const maskPhone = (phone?: string) => {
    if (!phone) return '+91-XXXXX-43210';
    const clean = phone.replace(/[\s\-]/g, '');
    if (clean.length < 5) return '***' + clean;
    return `${clean.slice(0, 3)}-XXXXX-${clean.slice(-4)}`;
  };

  // Live preview template
  const previewPatientName = currentUser?.name || 'Valued Patient';
  const liveSmsBody = `Hello ${previewPatientName},\n\nThis is your medication reminder from CarePilot-AI.\n\n💊 Medicine: ${medName || '[Tablet Name]'}\n📋 Dosage: ${dosage || '[Dosage]'}\n🕒 Reminder Time: ${time || '[Time]'}\n📅 Frequency: ${frequency || '[Frequency]'}\n\nPlease take your medicine as prescribed by your healthcare professional.\n\nThank you,\nCarePilot-AI Health Assistant`;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName) return;

    if (smsEnabled && !smsConsent) {
      setSmsStatusAlert({
        type: 'attention',
        message: 'Patient consent is required to enable SMS medication reminders.',
      });
      return;
    }

    onCreateReminder?.(
      medName,
      strength,
      time,
      foodTiming,
      dosage,
      frequency,
      phoneNumber,
      smsEnabled,
      smsConsent
    );

    setMedName('');
    setStrength('25mg');
    setDosage('1 Tablet');
    setTime('08:00 AM');
    setFrequency('Once daily');
    setFoodTiming('After breakfast');
    setIsNewModalOpen(false);

    setSmsStatusAlert({
      type: 'success',
      message: `Reminder scheduled for ${medName}! SMS status: ${smsEnabled ? 'Scheduled' : 'Disabled'}.`,
    });
    setTimeout(() => setSmsStatusAlert(null), 6000);
  };

  // Test SMS delivery trigger
  const handleTestSendSms = async (rem: MedicationReminder) => {
    setIsSendingSmsId(rem.id);
    try {
      // Force = true allows testing on demand without cooldown blocks
      const targetPhone = rem.phoneNumber || currentUser?.emergencyContact;
      const result: SmsDispatchResult = await apiClient.sendSmsReminder(rem.id, true, targetPhone);
      if (result.success) {
        setSmsStatusAlert({
          type: 'success',
          message: `SMS Sent successfully to ${result.recipientMasked || maskPhone(targetPhone)}!`,
          details: result.smsBody,
        });
      } else {
        setSmsStatusAlert({
          type: 'critical',
          message: `SMS delivery failed: ${result.message || result.error}`,
        });
      }
    } catch (err: any) {
      setSmsStatusAlert({
        type: 'critical',
        message: `Failed to trigger SMS: ${err.message || 'Network error'}`,
      });
    } finally {
      setIsSendingSmsId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* SMS Gateway & System Status Banner */}
      <Card
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-bg, rgba(14, 165, 233, 0.12))',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Smartphone size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                SMS Medication Reminders Gateway
              </h3>
              <Badge variant={smsConfig.devMode || smsConfig.provider === 'mock' ? 'info' : 'success'} size="sm">
                {smsConfig.devMode || smsConfig.provider === 'mock'
                  ? 'Mock / Dev Mode'
                  : smsConfig.trialMode
                  ? 'Twilio Trial Gateway (Predefined Template)'
                  : 'Twilio Gateway Active'}
              </Badge>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
              {smsConfig.devMode || smsConfig.provider === 'mock'
                ? 'Development mode active: Reminders simulate SMS delivery safely without real carrier charges. Add Twilio credentials in backend .env for live gateway.'
                : smsConfig.trialMode
                ? `Twilio Trial connected (${smsConfig.templateName || 'sms_appointment_reminders'}). Dispatches pre-approved appointment reminder templates to verified recipient numbers.`
                : 'Production Twilio gateway connected. Custom medication SMS notifications will be dispatched to patient phone numbers.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const cfg = await apiClient.getSmsConfig();
              setSmsConfig(cfg);
              setSmsStatusAlert({
                type: 'info',
                message: `SMS Gateway refreshed: ${cfg.provider.toUpperCase()} provider (Dev Mode: ${cfg.devMode ? 'Active' : 'Off'}).`,
              });
              setTimeout(() => setSmsStatusAlert(null), 4000);
            }}
            leftIcon={<RefreshCw size={14} />}
          >
            Check Gateway
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            leftIcon={<Plus size={16} />}
          >
            Add Reminder
          </Button>
        </div>
      </Card>

      {/* Adherence Summary Bar */}
      <Card style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Bell size={22} color="var(--color-primary)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                Medication Schedule & Adherence Tracker
              </h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              Configure automatic SMS alerts and track daily prescription adherence.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Today's Adherence</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: adherencePercent > 50 ? 'var(--color-success)' : 'var(--color-attention)' }}>
              {takenCount} of {totalCount} Taken ({adherencePercent}%)
            </span>
          </div>
        </div>

        {/* Adherence Progress Bar */}
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-full)', marginTop: '1.25rem', overflow: 'hidden' }}>
          <div
            style={{
              width: `${adherencePercent}%`,
              height: '100%',
              backgroundColor: 'var(--color-success)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease-out',
            }}
          />
        </div>
      </Card>

      {/* Status Alert Notification */}
      {smsStatusAlert && (
        <Alert type={smsStatusAlert.type}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              {smsStatusAlert.type === 'success' && <CheckCircle2 size={16} />}
              {smsStatusAlert.type === 'critical' && <AlertCircle size={16} />}
              {smsStatusAlert.type === 'info' && <Info size={16} />}
              <span>{smsStatusAlert.message}</span>
            </div>
            {smsStatusAlert.details && (
              <div
                style={{
                  marginTop: '0.25rem',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  border: '1px solid var(--color-border)',
                }}
              >
                {smsStatusAlert.details}
              </div>
            )}
          </div>
        </Alert>
      )}

      {/* Reminders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
          Today's Scheduled Dosages & SMS Status
        </h3>

        {reminders.map((rem) => {
          const isTaken = rem.status === 'taken';
          const isSkipped = rem.status === 'skipped';
          const smsStatus = rem.smsStatus || (rem.smsEnabled ? 'scheduled' : 'disabled');
          const isSmsSending = isSendingSmsId === rem.id;

          return (
            <Card
              key={rem.id}
              style={{
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                opacity: isTaken ? 0.85 : 1,
                borderLeft: `4px solid ${
                  isTaken ? 'var(--color-success)' : isSkipped ? 'var(--color-critical)' : 'var(--color-primary)'
                }`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 320px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isTaken ? 'var(--color-success-bg, rgba(34, 197, 94, 0.12))' : 'var(--color-accent, rgba(14, 165, 233, 0.1))',
                    color: isTaken ? 'var(--color-success)' : 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isTaken ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-main)', textDecoration: isTaken ? 'line-through' : 'none' }}>
                      {rem.medicationName} {rem.strength}
                    </h4>
                    <Badge variant={isTaken ? 'success' : isSkipped ? 'critical' : 'attention'} size="sm">
                      {rem.status.toUpperCase()}
                    </Badge>

                    {/* SMS Status Badges */}
                    {smsStatus === 'sent' && (
                      <Badge variant="success" size="sm">
                        SMS: Sent {rem.smsSentAt ? `(${rem.smsSentAt})` : ''}
                      </Badge>
                    )}
                    {smsStatus === 'scheduled' && (
                      <Badge variant="info" size="sm">
                        SMS: Scheduled
                      </Badge>
                    )}
                    {smsStatus === 'failed' && (
                      <Badge variant="critical" size="sm">
                        SMS: Failed
                      </Badge>
                    )}
                    {smsStatus === 'disabled' && (
                      <Badge variant="default" size="sm">
                        SMS: Disabled
                      </Badge>
                    )}
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                    <span><strong>⏰ {rem.scheduledTime}</strong></span>
                    <span>•</span>
                    <span>💊 Dosage: <strong>{rem.dosage || rem.strength}</strong></span>
                    <span>•</span>
                    <span>📅 {rem.frequency || 'Once daily'}</span>
                    <span>•</span>
                    <span>🍽️ {rem.timingWithFood}</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📱 Recipient: {maskPhone(rem.phoneNumber || currentUser?.emergencyContact)}</span>
                    {rem.smsConsent ? (
                      <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <ShieldCheck size={12} /> Consent Verified
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-attention)' }}>⚠️ Consent Pending</span>
                    )}
                    {rem.takenAt && <span>• Confirmed taken at {rem.takenAt}</span>}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* Send SMS Test Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestSendSms(rem)}
                  isLoading={isSmsSending}
                  disabled={isSmsSending}
                  leftIcon={<Send size={13} />}
                >
                  Send SMS (Test)
                </Button>

                {!isTaken && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onUpdateStatus(rem.id, 'taken')}
                    leftIcon={<Check size={14} />}
                  >
                    Mark Taken
                  </Button>
                )}
                {rem.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateStatus(rem.id, 'snoozed')}
                    >
                      Snooze 15m
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onUpdateStatus(rem.id, 'skipped')}
                    >
                      Skip
                    </Button>
                  </>
                )}
                {isTaken && (
                  <Badge variant="success">Completed</Badge>
                )}
                {onDeleteReminder && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteReminder(rem.id)}
                    title="Delete Reminder"
                    style={{ color: 'var(--color-critical)', padding: '0.4rem 0.6rem' }}
                  >
                    <Trash2 size={15} />
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Reminder Modal with SMS Configuration and Live Preview */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Schedule Medication Reminder & SMS Alert"
        description="Configure automated reminders and SMS delivery for patients or caregivers."
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <Input
            label="Medication Name *"
            placeholder="e.g. Metoprolol Tartrate, Pantoprazole"
            value={medName}
            onChange={(e) => setMedName(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Tablet / Medicine Strength"
              placeholder="e.g. 25mg, 500mg"
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
            />
            <Input
              label="Dosage Quantity *"
              placeholder="e.g. 1 Tablet, 2 Capsules, 10ml"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Scheduled Reminder Time *"
              type="text"
              placeholder="e.g. 08:00 AM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-main)', marginBottom: '0.375rem' }}>
                Frequency *
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-main)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              >
                <option value="Once daily">Once daily</option>
                <option value="Twice daily (1-0-1)">Twice daily (1-0-1)</option>
                <option value="Three times daily (1-1-1)">Three times daily (1-1-1)</option>
                <option value="Every 8 hours">Every 8 hours</option>
                <option value="As prescribed">As prescribed</option>
              </select>
            </div>
          </div>

          <Input
            label="Relation with Food"
            placeholder="e.g. After breakfast, Before food"
            value={foodTiming}
            onChange={(e) => setFoodTiming(e.target.value)}
          />

          {/* SMS Configuration Section */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--color-surface-hover, rgba(0, 0, 0, 0.02))',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} color="var(--color-primary)" />
                <span style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  SMS Medication Reminders
                </span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
                />
                <span>Enable SMS Alerts</span>
              </label>
            </div>

            {smsEnabled && (
              <>
                <Input
                  label="Patient / Caregiver Phone Number"
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required={smsEnabled}
                />

                {/* Patient Consent Checkbox */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.625rem',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-main)',
                    marginTop: '0.25rem',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: smsConsent ? 'var(--color-success-bg, rgba(34, 197, 94, 0.08))' : 'var(--color-surface)',
                    border: `1px solid ${smsConsent ? 'var(--color-success)' : 'var(--color-border)'}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={smsConsent}
                    onChange={(e) => setSmsConsent(e.target.checked)}
                    required={smsEnabled}
                    style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px', marginTop: '2px' }}
                  />
                  <span>
                    <strong>Patient Consent:</strong> I confirm patient or authorized caregiver consent to receive automated medication reminder SMS messages at this phone number.
                  </span>
                </label>

                {/* Live SMS Preview Box */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Smartphone size={13} />
                    <span>LIVE SMS PREVIEW (CarePilot-AI Standard Format):</span>
                  </div>
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px dashed var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-main)',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    {liveSmsBody}
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm & Schedule Reminder
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
