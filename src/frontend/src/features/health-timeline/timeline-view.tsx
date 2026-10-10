import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { TrendChart } from './trend-chart';
import { HealthFact } from '../../types/extraction';
import { MedicalDocument } from '../../types/document';
import { formatDate, getDocumentTypeLabel } from '../../lib/formatters';
import { Activity, Calendar, FileText, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';

interface TimelineViewProps {
  healthFacts: HealthFact[];
  documents: MedicalDocument[];
  onSelectDocument?: (doc: MedicalDocument) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  healthFacts,
  documents,
  onSelectDocument,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Group facts by test name for charts
  const hemoglobinFacts = healthFacts.filter(f => f.testName.toLowerCase().includes('haemoglobin'));
  const sugarFacts = healthFacts.filter(f => f.testName.toLowerCase().includes('blood sugar'));

  // Sort chronological events (combining documents and observed facts)
  const sortedDocuments = [...documents].sort((a, b) => 
    new Date(b.documentDate || b.uploadDate).getTime() - new Date(a.documentDate || a.uploadDate).getTime()
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Overview stats banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Latest Haemoglobin
            </span>
            <Badge variant="critical" size="sm">Attention</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-critical)' }}>11.2</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>g/dL</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingDown size={14} color="var(--color-critical)" /> Down from 11.8 g/dL (Jun 2026)
          </p>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Fasting Blood Sugar
            </span>
            <Badge variant="success" size="sm">Optimal</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-success)' }}>98</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>mg/dL</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Standard Range: 70 - 100 mg/dL
          </p>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              HbA1c Glycemic Index
            </span>
            <Badge variant="success" size="sm">Non-Diabetic</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-success)' }}>5.6</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>%</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Reference Interval: &lt; 5.7 %
          </p>
        </Card>
      </div>

      {/* Interactive Trend Charts */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} color="var(--color-primary)" /> Longitudinal Diagnostic Parameter Trends
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          <TrendChart
            testName="Haemoglobin Trend (g/dL)"
            unit="g/dL"
            facts={hemoglobinFacts}
            referenceRangeText="13.0 - 17.0 g/dL"
          />
          <TrendChart
            testName="Fasting Blood Sugar (mg/dL)"
            unit="mg/dL"
            facts={sugarFacts}
            referenceRangeText="70 - 100 mg/dL"
          />
        </div>
      </div>

      {/* Chronological Health Timeline */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} color="var(--color-primary)" /> Chronological Health History & Records
        </h3>

        <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {sortedDocuments.map((doc) => (
            <div key={doc.id} style={{ position: 'relative' }}>
              {/* Timeline marker */}
              <div
                style={{
                  position: 'absolute',
                  left: '-1.95rem',
                  top: '1.25rem',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-surface)',
                  border: '3px solid var(--color-primary)',
                }}
              />

              <Card style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {formatDate(doc.documentDate || doc.uploadDate)}
                    </span>
                    <h4
                      style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '0.25rem', cursor: 'pointer' }}
                      onClick={() => onSelectDocument?.(doc)}
                    >
                      {doc.filename}
                    </h4>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      {doc.facilityOrDoctor} • {getDocumentTypeLabel(doc.documentType)}
                    </span>
                  </div>
                  <Badge variant={doc.status === 'processed' ? 'success' : 'attention'}>
                    {doc.status}
                  </Badge>
                </div>

                {doc.summary && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.75rem', lineHeight: 1.5 }}>
                    {doc.summary}
                  </p>
                )}

                <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onSelectDocument?.(doc)}
                    style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    Inspect Document & Observations <ArrowUpRight size={14} />
                  </button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
