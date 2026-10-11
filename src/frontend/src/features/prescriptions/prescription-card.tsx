import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { Input } from '../../components/ui/input';
import { TeluguTranslationPanel } from './telugu-translation-panel';
import { Prescription, MedicationInstruction } from '../../types/prescription';
import { formatDate } from '../../lib/formatters';
import { 
  Pill, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Bell, 
  BellOff, 
  BellRing, 
  CheckCircle2, 
  Info,
  Edit3,
  Check,
  Trash2,
} from 'lucide-react';

// Derive a default clock time from the free-text timing field
function deriveDefaultTime(timing: string): string {
  const lower = timing ? timing.toLowerCase() : '';
  if (lower.includes('morning') || lower.includes('breakfast') || lower.includes('am'))
    return '08:00';
  if (lower.includes('noon') || lower.includes('lunch') || lower.includes('afternoon'))
    return '13:00';
  if (lower.includes('evening'))
    return '18:00';
  if (lower.includes('night') || lower.includes('dinner') || lower.includes('pm'))
    return '20:00';
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
  onUpdateMedication?: (rxId: string, medId: string, updates: Partial<MedicationInstruction>) => void;
  onDeletePrescription?: (rxId: string) => Promise<void>;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  prescription,
  onScheduleReminder,
  onVerifyMedication,
  onUpdateMedication,
  onDeletePrescription,
}) => {
  // Delete state
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!onDeletePrescription) {
      setDeleteError('Delete action is unavailable.');
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDeletePrescription(prescription.id);
      setIsConfirmDeleteOpen(false);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete prescription. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

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

  // Editing state for patient review
  const [editingMed, setEditingMed] = useState<MedicationInstruction | null>(null);
  const [editName, setEditName] = useState('');
  const [editStrength, setEditStrength] = useState('');
  const [editDosage, setEditDosage] = useState('');
  const [editFrequency, setEditFrequency] = useState('');
  const [editTiming, setEditTiming] = useState('');
  const [editDuration, setEditDuration] = useState('');

  const handleOpenEdit = (med: MedicationInstruction) => {
    setEditingMed(med);
    setEditName(med.name === 'Not detected' ? '' : med.name);
    setEditStrength(med.strength === 'Not detected' ? '' : med.strength);
    setEditDosage(med.dosage === 'Not detected' ? '' : med.dosage);
    setEditFrequency(med.frequency === 'Not detected' ? '' : med.frequency);
    setEditTiming(med.timing === 'Not detected' ? '' : med.timing);
    setEditDuration(med.duration === 'Not detected' ? '' : med.duration);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMed) return;

    const updates: Partial<MedicationInstruction> = {
      name: editName.trim() || 'Prescribed Medicine',
      strength: editStrength.trim() || 'As prescribed',
      dosage: editDosage.trim() || '1 tablet',
      frequency: editFrequency.trim() || 'Once daily',
      timing: editTiming.trim() || 'After food',
      duration: editDuration.trim() || 'As prescribed',
      confirmed: true, // Mark confirmed on patient review
    };

    onUpdateMedication?.(prescription.id, editingMed.id, updates);
    setEditingMed(null);
  };

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (typeof Notification === 'undefined') return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    const perm = await Notification.requestPermission();
    return perm;
  };

  const handleToggleReminder = async (med: MedicationInstruction) => {
    const current = reminderStates[med.id];
    const nowEnabled = !current?.enabled;

    if (nowEnabled) {
      const perm = await requestNotificationPermission();
      setReminderStates((prev) => ({
        ...prev,
        [med.id]: { ...(prev[med.id] || { time: '08:00' }), enabled: true, notifPermission: perm, saved: false },
      }));
    } else {
      setReminderStates((prev) => ({
        ...prev,
        [med.id]: { ...(prev[med.id] || { time: '08:00', notifPermission: 'default' }), enabled: false, saved: false },
      }));
    }
  };

  const handleSaveReminder = (med: MedicationInstruction) => {
    const rs = reminderStates[med.id];
    const [h, m] = (rs?.time || '08:00').split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const displayTime = `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;

    onScheduleReminder?.({ ...med, timing: med.timing });

    setReminderStates((prev) => ({
      ...prev,
      [med.id]: { ...(prev[med.id] || { enabled: true, time: rs.time, notifPermission: rs.notifPermission }), saved: true },
    }));

    if (rs?.notifPermission === 'granted') {
      new Notification(`CarePilot: Reminder set for ${med.name}`, {
        body: `Daily at ${displayTime} — ${med.timing}.`,
        icon: '/favicon.ico',
        tag: `reminder-${med.id}`,
      });
    }
  };

  const renderFieldOrNotDetected = (value: string | undefined, label: string) => {
    if (!value || value === 'Not detected') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <span>{label}:</span>
          <span
            style={{
              color: 'var(--color-critical)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              padding: '1px 6px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            Not detected
          </span>
        </span>
      );
    }
    return (
      <span>
        {label}: <strong>{value}</strong>
      </span>
    );
  };

  const isPrescriberDetected = prescription.prescribedBy && prescription.prescribedBy !== 'Not detected';

  return (
    <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Prescription header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Pill size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
              {isPrescriberDetected ? `Prescription by ${prescription.prescribedBy}` : 'Uploaded Prescription Slip'}
            </h3>
            {!isPrescriberDetected && (
              <Badge variant="attention" size="sm">
                Doctor: Not detected
              </Badge>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '0.375rem',
              fontSize: '0.8125rem',
              color: 'var(--color-text-secondary)',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={13} /> Date:{' '}
              {prescription.prescribedDate === 'Not detected' ? (
                <span style={{ color: 'var(--color-critical)' }}>Not detected</span>
              ) : (
                formatDate(prescription.prescribedDate)
              )}
            </span>
            <span>
              • Indication:{' '}
              {prescription.diagnosis === 'Not detected' ? (
                <span style={{ color: 'var(--color-critical)' }}>Not detected</span>
              ) : (
                <strong>{prescription.diagnosis}</strong>
              )}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Badge variant={prescription.status === 'active' ? 'success' : 'default'}>
            {prescription.status.toUpperCase()}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDeleteError(null);
              setIsConfirmDeleteOpen(true);
            }}
            disabled={isDeleting}
            leftIcon={<Trash2 size={14} />}
            style={{ color: 'var(--color-critical)' }}
            title="Delete this prescription"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Medication items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {prescription.medications.map((med) => {
          const rs = reminderStates[med.id] || {
            enabled: false,
            time: deriveDefaultTime(med.timing),
            notifPermission: 'default',
            saved: false,
          };

          return (
            <div
              key={med.id}
              style={{
                padding: '1.125rem',
                backgroundColor: 'var(--color-surface)',
                border: `1px solid ${!med.confirmed ? 'var(--color-border-attention, rgba(234, 179, 8, 0.4))' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Medication header row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      {med.name === 'Not detected' ? (
                        <span style={{ color: 'var(--color-critical)' }}>Medicine Name: Not detected</span>
                      ) : (
                        med.name
                      )}
                    </h4>
                    {med.strength !== 'Not detected' && (
                      <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                        {med.strength}
                      </span>
                    )}
                    <Badge variant={med.confirmed ? 'success' : 'attention'} size="sm">
                      {med.confirmed ? 'Verified Schedule' : 'Unverified • Patient Review Required'}
                    </Badge>
                  </div>

                  {/* Field list showing extracted details or Not detected */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginTop: '0.375rem',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {renderFieldOrNotDetected(med.dosage, 'Dosage')}
                    <span>•</span>
                    {renderFieldOrNotDetected(med.frequency, 'Frequency')}
                    <span>•</span>
                    {renderFieldOrNotDetected(med.timing, 'Timing')}
                    <span>•</span>
                    {renderFieldOrNotDetected(med.duration, 'Duration')}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(med)}
                    leftIcon={<Edit3 size={13} />}
                  >
                    Review & Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDeleteError(null);
                      setIsConfirmDeleteOpen(true);
                    }}
                    disabled={isDeleting}
                    leftIcon={<Trash2 size={13} />}
                    style={{
                      color: 'var(--color-critical)',
                      borderColor: 'rgba(239, 68, 68, 0.35)',
                    }}
                    title="Delete this prescription"
                  >
                    Delete
                  </Button>

                  {!med.confirmed && onVerifyMedication && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onVerifyMedication(med.id)}
                      leftIcon={<Check size={13} />}
                    >
                      Confirm
                    </Button>
                  )}
                </div>
              </div>

              {/* Warnings */}
              {med.warnings && med.warnings.length > 0 && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontSize: '0.75rem',
                    color: 'var(--color-attention)',
                  }}
                >
                  <AlertTriangle size={14} />
                  <span>{med.warnings.join(' ')}</span>
                </div>
              )}

              {/* Regional language instruction translation (English, Telugu, Hindi) */}
              <TeluguTranslationPanel
                medicationName={med.name}
                englishText={med.instructionsEnglish}
                teluguText={med.instructionsTelugu}
                hindiText={med.instructionsHindi}
              />

              {/* Reminder configuration */}
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
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {rs.enabled ? (
                      <BellRing size={16} color="var(--color-primary)" />
                    ) : (
                      <Bell size={16} color="var(--color-text-muted)" />
                    )}
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: rs.enabled ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                      }}
                    >
                      Daily Reminder & SMS Alerts
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
                    onClick={() => handleToggleReminder(med)}
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      alignItems: 'center',
                      width: '44px',
                      height: '24px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: rs.enabled ? 'var(--color-primary)' : 'var(--color-border)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)',
                      padding: '2px',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-surface)',
                        boxShadow: 'var(--shadow-sm)',
                        transform: rs.enabled ? 'translateX(20px)' : 'translateX(0)',
                        transition: 'transform var(--transition-fast)',
                      }}
                    />
                  </button>
                </div>

                {/* Reminder time and save row */}
                {rs.enabled && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Clock size={14} color="var(--color-text-secondary)" />
                      <input
                        type="time"
                        value={rs.time}
                        onChange={(e) =>
                          setReminderStates((prev) => ({
                            ...prev,
                            [med.id]: { ...(prev[med.id] || rs), time: e.target.value, saved: false },
                          }))
                        }
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text-main)',
                          fontSize: '0.8125rem',
                        }}
                      />
                    </div>

                    <Button size="sm" variant="primary" onClick={() => handleSaveReminder(med)}>
                      {rs.saved ? 'Update Reminder' : 'Set Reminder'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit & Review Modal for patient to correct or verify extracted details */}
      {editingMed && (
        <Modal
          isOpen={true}
          onClose={() => setEditingMed(null)}
          title="Review & Verify Medication Details"
          description="Correct any unreadable or 'Not detected' fields extracted from your prescription slip."
        >
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Medicine Name *"
              placeholder="e.g. Amoxicillin, Paracetamol"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Strength"
                placeholder="e.g. 500mg, 25mg"
                value={editStrength}
                onChange={(e) => setEditStrength(e.target.value)}
              />
              <Input
                label="Dosage"
                placeholder="e.g. 1 Tablet, 5ml"
                value={editDosage}
                onChange={(e) => setEditDosage(e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Frequency"
                placeholder="e.g. Twice daily (1-0-1)"
                value={editFrequency}
                onChange={(e) => setEditFrequency(e.target.value)}
              />
              <Input
                label="Timing"
                placeholder="e.g. After food"
                value={editTiming}
                onChange={(e) => setEditTiming(e.target.value)}
              />
            </div>
            <Input
              label="Duration"
              placeholder="e.g. 5 days, 1 month"
              value={editDuration}
              onChange={(e) => setEditDuration(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="outline" type="button" onClick={() => setEditingMed(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save & Confirm Medication
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmDeleteOpen && (
        <Modal
          isOpen={isConfirmDeleteOpen}
          onClose={() => {
            if (!isDeleting) setIsConfirmDeleteOpen(false);
          }}
          title="Delete Prescription"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--color-text-main)',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Are you sure you want to delete this prescription? This action cannot be undone.
            </p>

            {deleteError && (
              <div
                style={{
                  padding: '0.625rem 0.875rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-critical)',
                  color: 'var(--color-critical)',
                  fontSize: '0.8125rem',
                }}
              >
                {deleteError}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '0.5rem',
              }}
            >
              <Button
                variant="outline"
                onClick={() => setIsConfirmDeleteOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                isLoading={isDeleting}
                disabled={isDeleting}
                leftIcon={<Trash2 size={14} />}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
};

export default PrescriptionCard;
