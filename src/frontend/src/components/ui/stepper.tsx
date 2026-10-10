import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: string;
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  activeStepIndex: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, activeStepIndex }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
      {steps.map((step, index) => {
        const isCompleted = index < activeStepIndex;
        const isActive = index === activeStepIndex;

        return (
          <React.Fragment key={step.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  transition: 'all var(--transition-fast)',
                  backgroundColor: isCompleted
                    ? 'var(--color-success)'
                    : isActive
                    ? 'var(--color-primary)'
                    : 'var(--color-border)',
                  color: isCompleted || isActive ? '#ffffff' : 'var(--color-text-muted)',
                }}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : index + 1}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: isActive || isCompleted ? 600 : 500,
                    color: isActive
                      ? 'var(--color-primary)'
                      : isCompleted
                      ? 'var(--color-text-main)'
                      : 'var(--color-text-muted)',
                  }}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                    {step.description}
                  </span>
                )}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--color-border)',
                  transition: 'all var(--transition-fast)',
                  minWidth: '1.5rem',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
