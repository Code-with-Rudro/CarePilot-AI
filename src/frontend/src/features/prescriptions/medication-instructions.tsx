import React from 'react';

interface MedicationInstructionsProps {
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  notes?: string;
}

export const MedicationInstructions: React.FC<MedicationInstructionsProps> = ({
  name, dosage, frequency, timing, notes,
}) => {
  return (
    <div style={{
      background: 'var(--color-accent)', borderRadius: 'var(--radius-md)',
      padding: '1rem 1.25rem', border: '1px solid var(--color-border-subtle)',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
    }}>
      <div style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.9375rem' }}>{name}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem 1rem' }}>
        {[
          ['Dosage', dosage], ['Frequency', frequency], ['Timing', timing],
        ].map(([label, val]) => (
          <div key={label} style={{ fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>{label}: </span>
            <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>{val}</span>
          </div>
        ))}
      </div>
      {notes && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          <em>{notes}</em>
        </div>
      )}
    </div>
  );
};
