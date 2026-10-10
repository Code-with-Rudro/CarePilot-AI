import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert } from '../../components/ui/alert';
import { Modal } from '../../components/ui/modal';
import { Input } from '../../components/ui/input';
import { MedicationReminder } from '../../types/reminder';
import { Bell, Check, X, Clock, Plus, Zap, CheckCircle2 } from 'lucide-react';

interface RemindersViewProps {
  reminders: MedicationReminder[];
  onUpdateStatus: (id: string, status: 'taken' | 'skipped' | 'snoozed') => void;
  onCreateReminder?: (medicationName: string, strength: string, time: string, timingFood: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  onUpdateStatus,
  onCreateReminder,
}) => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [medName, setMedName] = useState('');
  const [strength, setStrength] = useState('');
  const [time, setTime] = useState('08:00 AM');
  const [foodTiming, setFoodTiming] = useState('After breakfast');
  const [n8nStatus, setN8nStatus] = useState<string | null>(null);

  const takenCount = reminders.filter(r => r.status === 'taken').length;
  const totalCount = reminders.length;
  const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName) return;
    onCreateReminder?.(medName, strength, time, foodTiming);
    setMedName('');
    setStrength('');
    setIsNewModalOpen(false);
    setN8nStatus(`Reminder scheduled! Webhook dispatch dispatched via n8n automation.`);
    setTimeout(() => setN8nStatus(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Adherence Summary Bar */}
      <Card style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Bell size={22} color="var(--color-primary)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                Medication Reminders & Adherence Tracker
              </h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              Confirmed schedules dispatch automated alerts via n8n webhook automation.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Today's Adherence</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: adherencePercent > 50 ? 'var(--color-success)' : 'var(--color-attention)' }}>
                {takenCount} of {totalCount} Taken ({adherencePercent}%)
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNewModalOpen(true)}
              leftIcon={<Plus size={16} />}
            >
              Add Reminder
            </Button>
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

      {n8nStatus && (
        <Alert type="success">
          <Zap size={16} style={{ marginRight: '0.375rem', display: 'inline' }} />
          {n8nStatus}
        </Alert>
      )}

      {/* Reminders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
          Today's Scheduled Dosages
        </h3>

        {reminders.map((rem) => {
          const isTaken = rem.status === 'taken';
          const isSkipped = rem.status === 'skipped';

          return (
            <Card
              key={rem.id}
              style={{
                padding: '1.125rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                opacity: isTaken ? 0.8 : 1,
                borderLeft: `4px solid ${isTaken ? 'var(--color-success)' : isSkipped ? 'var(--color-critical)' : 'var(--color-primary)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isTaken ? 'var(--color-success-bg)' : 'var(--color-accent)',
                    color: isTaken ? 'var(--color-success)' : 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isTaken ? <CheckCircle2 size={22} /> : <Clock size={22} />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)', textDecoration: isTaken ? 'line-through' : 'none' }}>
                      {rem.medicationName} {rem.strength}
                    </h4>
                    <Badge variant={isTaken ? 'success' : isSkipped ? 'critical' : 'attention'} size="sm">
                      {rem.status.toUpperCase()}
                    </Badge>
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <strong>{rem.scheduledTime}</strong> • {rem.timingWithFood}
                    {rem.takenAt && <span>(Confirmed at {rem.takenAt})</span>}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Reminder Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Schedule Medication Reminder"
        description="Configure automated reminders for verified prescription timings."
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Medication Name"
            placeholder="e.g. Metoprolol, Pantoprazole"
            value={medName}
            onChange={(e) => setMedName(e.target.value)}
            required
          />
          <Input
            label="Strength / Dosage"
            placeholder="e.g. 25mg, 1 Tablet"
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Time"
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <Input
              label="Relation with Food"
              placeholder="e.g. After breakfast"
              value={foodTiming}
              onChange={(e) => setFoodTiming(e.target.value)}
            />
          </div>

          <Alert type="info">
            <strong>n8n Automation Flow:</strong> Scheduling creates an automated webhook event dispatched to n8n to send push notifications and log adherence records.
          </Alert>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm & Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
