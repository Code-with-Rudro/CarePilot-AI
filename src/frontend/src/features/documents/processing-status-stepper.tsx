import React from 'react';
import { Stepper, StepItem } from '../../components/ui/stepper';

interface ProcessingStatusStepperProps {
  currentStage: 'uploaded' | 'reading' | 'extracting' | 'needs_review' | 'processed';
}

export const ProcessingStatusStepper: React.FC<ProcessingStatusStepperProps> = ({ currentStage }) => {
  const steps: StepItem[] = [
    { id: '1', label: 'Uploaded', description: 'File encrypted' },
    { id: '2', label: 'Reading', description: 'Layout & OCR' },
    { id: '3', label: 'Extracting', description: 'Clinical entities' },
    { id: '4', label: 'Review', description: 'Human verify' },
    { id: '5', label: 'Completed', description: 'Ready in Timeline' },
  ];

  const getActiveIndex = () => {
    switch (currentStage) {
      case 'uploaded': return 0;
      case 'reading': return 1;
      case 'extracting': return 2;
      case 'needs_review': return 3;
      case 'processed': return 4;
      default: return 0;
    }
  };

  return (
    <div style={{ padding: '0.75rem 0' }}>
      <Stepper steps={steps} activeStepIndex={getActiveIndex()} />
    </div>
  );
};
