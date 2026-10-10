import React from 'react';
import { Badge } from '../../components/ui/badge';

interface ConfidenceBadgeProps {
  confidence: number; // 0.0 to 1.0
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence }) => {
  const percent = Math.round(confidence * 100);

  if (confidence >= 0.9) {
    return <Badge variant="success" size="sm">High Confidence ({percent}%)</Badge>;
  } else if (confidence >= 0.75) {
    return <Badge variant="attention" size="sm">Moderate ({percent}%)</Badge>;
  } else {
    return <Badge variant="critical" size="sm">Low Confidence ({percent}%) • Review Needed</Badge>;
  }
};
