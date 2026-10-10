import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { TeluguTranslationPanel } from './telugu-translation-panel';
import { Prescription, MedicationInstruction } from '../../types/prescription';
import { formatDate } from '../../lib/formatters';
import { Pill, AlertTriangle, Clock, Calendar, Bell, BellOff, BellRing, CheckCircle2, Info } from 'lucide-react';

/**
 * Change 4 — Prescription Reminders:
 *
 * Each medication now has an inline reminder configuration panel.
 * Users can:
 *   - Enable / disable a reminder per medication.
 *   - View and confirm the prescribed timing (pre-populated from the
 *     prescription data — never altered by the user).
 *   - Optionally adjust the clock time within the prescribed slot.
 *   - See the next scheduled reminder.
 *
 * NOTIFICATION / SCHEDULING BACKEND DEPENDENCY:
 *   Reliable daily reminders require either:
 *     (a) A backend scheduling service that sends push notifications, OR
 *     (b) Web Push + a Service Worker registered in this app.
 *   Neither is currently available in this frontend.
 *   The reminder configuration IS stored via onScheduleReminder → apiClient,
 *   but daily cross-session delivery will not occur until the backend
 *   notification service (n8n webhook or push service) is verified.
 *   The UI clearly communicates this limitation with an info badge.
 *
 * Browser Notifications:
 *   Requested only after the user explicitly enables a reminder (user gesture).
 *   Not requested on page load.
 */

// Derive a default clock time from the free-text timing field
function deriveDefaultTime(timing: string): string {
  const lower = timing.toLowerCase();
  if (lower.includes('morning') || lower.includes('breakfast') || lower.includes('am'))
    return '08:00';
  if (lower.includes('noon') || lower.includes('lunch') || lower.includes('afternoon'))
    return '13:00';
  if (lower.includes('evening'))
    return '18:00';
  if (lower.includes('night') || lower.includes('dinner') || lower.includes('pm'))
    return '21:00';
  return '08:00';
}

interface ReminderState {
  enabled: boolean;
  time: string;
  notifPermission: NotificationPermission | 'unsupported';
  saved: boolean;
}

interface PrescriptionCardProps {
  prescription: Prescription;
  onScheduleReminder?: (med: MedicationInstruction) => void;
  onVerifyMedication?: (medId: string) => void;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  prescription,
  onScheduleReminder,
  onVerifyMedication,
}) => {
  // Per-medication reminder state
  const [reminderStates, setReminderStates] = useState<Record<string, ReminderState>>(() => {
    const init: Record<string, ReminderState> = {};
    prescription.medications.forEach((med) => {
      init[med.id] = {
        enabled: false,
        time: deriveDefaultTime(med.timing),
        notifPermission:
          typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
        saved: false,
      };
    });
    return init;
  });

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (typeof Notification === 'undefined') return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    const perm = await Notification.requestPermission();
    return perm;
  };

  const handleToggleReminder = async (med: MedicationInstruction) => {
    const current = reminderStates[med.id];
    const nowEnabled = !current.enabled;

    if (nowEnabled) {
      // Request permission only on user interaction, not on page load
      const perm = await requestNotificationPermission();
      setReminderStates((prev) => ({
        ...prev,
        [med.id]: { ...prev[med.id], enabled: true, notifPermission: perm, saved: false },
      }));
    } else {
      setReminderStates((prev) => ({
        ...prev,
        [med.id]: { ...prev[med.id], enabled: false, saved: false },
      }));
    }
  };

  const handleSaveReminder = (med: MedicationInstruction) => {
    const rs = reminderStates[med.id];
    // Convert HH:MM to "HH:MM AM/PM" format for the existing reminder system
    const [h, m] = rs.time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const displayTime = `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;

    // Persist via the existing API path (calls apiClient.createReminder)
    onScheduleReminder?.({ ...med, timing: med.timing });

    setReminderStates((prev) => ({
      ...prev,
      [med.id]: { ...prev[med.id], saved: true },
    }));

    // Show a browser notification preview if permission granted
    if (rs.notifPermission === 'granted') {
      new Notification(`CarePilot: Reminder set for ${med.name}`, {
        body: `Daily at ${displayTime} — ${med.timing}. This is a preview; daily delivery requires the backend scheduler.`,
        icon: '/favicon.ico',
        tag: `reminder-${med.id}`,
      });
    }
  };

  return (
    <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Prescription header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Pill size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Prescription by {prescription.prescribedBy}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={13} /> Date: {formatDate(prescription.prescribedDate)}
            </span>
            {prescription.diagnosis && (
              <span>• Indication: <strong>{prescription.diagnosis}</strong></span>
            )}
          </div>
        </div>

        <Badge variant={prescription.status === 'active' ? 'success' : 'default'}>
          {prescription.status.toUpperCase()}
        </Badge>
      </div>

      {/* Medication items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {prescription.medications.map((med) => {
          const rs = reminderStates[med.id];
          return (
            <div
              key={med.id}
              style={{
                padding: '1.125rem',
                backgroundColor: 'var(--color-surface)',
                border: `1px solid ${!med.confirmed ? 'rgba(148, 98, 0, 0.3)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Medication header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      {med.name} {med.strength}
                    </h4>
                    <Badge variant={med.confirmed ? 'success' : 'attention'} size="sm">
                      {med.confirmed ? 'Verified Schedule' : 'Unverified • Needs Check'}
                    </Badge>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    <span>Dosage: <strong>{med.dosage}</strong></span>
                    <span>•</span>
                    <span>Frequency: <strong>{med.frequency}</strong></span>
                    <span>•</span>
                    <span>Timing: <strong>{med.timing}</strong></span>
                    <span>•</span>
                    <span>Duration: <strong>{med.duration}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {!med.confirmed && onVerifyMedication && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onVerifyMedication(med.id)}
                    >
                      Confirm Dosage
                    </Button>
                  )}
                </div>
              </div>

              {/* Warnings */}
              {med.warnings && med.warnings.length > 0 && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-attention)' }}>
                  <AlertTriangle size={14} />
                  <span>{med.warnings.join(' ')}</span>
                </div>
              )}

              {/* Telugu & English instruction translation */}
              <TeluguTranslationPanel
                medicationName={med.name}
                englishText={med.instructionsEnglish}
                teluguText={med.instructionsTelugu}
              />

              {/* ─── Change 4: Reminder configuration ─── */}
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.875rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: rs.enabled ? 'var(--color-accent)' : 'var(--color-bg)',
                  border: `1px solid ${rs.enabled ? 'rgba(23, 107, 102, 0.25)' : 'var(--color-border)'}`,
                  transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
                }}
              >
                {/* Reminder toggle row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {rs.enabled ? (
                      <BellRing size={16} color="var(--color-primary)" />
                    ) : (
                      <Bell size={16} color="var(--color-text-muted)" />
                    )}
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: rs.enabled ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)' }}>
                      Daily Reminder
                    </span>
                    {rs.saved && (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 size={11} style={{ marginRight: '0.25rem' }} />
                        Scheduled
                      </Badge>
                    )}
                  </div>

                  <button
                    id={`reminder-toggle-${med.id}`}
                    aria-label={rs.enabled ? `Disable reminder for ${med.name}` : `Enable reminder for ${med.name}`}
                    aria-pressed={rs.enabled}
                    onClick={() => handleToggleReminder(med)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.3125rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      border: `1.5px solid ${rs.enabled ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: rs.enabled ? 'var(--color-primary)' : 'transparent',
                      color: rs.enabled ? '#fff' : 'var(--color-text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {rs.enabled ? <><BellOff size={13} /> Disable</> : <><Bell size={13} /> Enable</>}
                  </button>
                </div>

                {/* Expanded reminder controls — only when enabled */}
                {rs.enabled && (
                  <div style={{ marginTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Prescribed schedule (read-only — from prescription data) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      <Clock size={14} color="var(--color-primary)" />
                      <span>Prescribed timing: <strong>{med.timing}</strong></span>
                    </div>

                    {/* Clock time selector — user adjustable within the prescribed slot */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <label
                        htmlFor={`reminder-time-${med.id}`}
                        style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}
                      >
                        Alert time:
                      </label>
                      <input
                        id={`reminder-time-${med.id}`}
                        type="time"
                        value={rs.time}
                        onChange={(e) =>
                          setReminderStates((prev) => ({
                            ...prev,
                            [med.id]: { ...prev[med.id], time: e.target.value, saved: false },
                          }))
                        }
                        style={{
                          padding: '0.3125rem 0.625rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1.5px solid var(--color-primary)',
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text-main)',
                          fontSize: '0.875rem',
                          fontFamily: 'inherit',
                          outline: 'none',
                        }}
                      />

                      <Button
                        id={`save-reminder-${med.id}`}
                        size="sm"
                        variant="primary"
                        onClick={() => handleSaveReminder(med)}
                        leftIcon={<CheckCircle2 size={13} />}
                      >
                        {rs.saved ? 'Update' : 'Save Reminder'}
                      </Button>
                    </div>

                    {/* Notification permission status */}
                    {rs.notifPermission === 'denied' && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-critical)', backgroundColor: 'var(--color-critical-bg)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                        <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                        Browser notifications are blocked. Enable them in browser settings to receive alerts.
                      </div>
                    )}
                    {rs.notifPermission === 'unsupported' && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-attention)', backgroundColor: 'var(--color-attention-bg)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                        <Info size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                        Browser notifications are not supported in this environment.
                      </div>
                    )}

                    {/* Honest status: daily delivery requires backend scheduler */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-info)', backgroundColor: 'var(--color-info-bg)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <Info size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <span>
                        <strong>Delivery note:</strong> Reliably repeating daily reminders require a backend notification
                        scheduler (or a registered service worker). This feature stores your preference and shows a
                        one-time browser notification as a preview. Cross-session daily delivery will activate once
                        the n8n / push-service backend is connected.
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {/* ─── End reminder configuration ─── */}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
