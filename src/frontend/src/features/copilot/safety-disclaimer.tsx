import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const SafetyDisclaimer: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.625rem 1rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        fontSize: '0.75rem',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.4,
      }}
    >
      <ShieldAlert size={16} color="var(--color-attention)" style={{ flexShrink: 0 }} />
      <span>
        <strong>Healthcare Safety Notice:</strong> CarePilot AI provides educational explanations grounded in your uploaded records. It does not provide medical diagnoses or prescribe treatment. For acute symptoms, please consult your physician or local emergency services.
      </span>
    </div>
  );
};
