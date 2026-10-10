import React from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { VerifiedMedicineInfo } from '../../lib/constants';
import { ShieldCheck, AlertCircle, FileText, CheckCircle2, Building, Sparkles } from 'lucide-react';

interface MedicineInfoPanelProps {
  medicine: VerifiedMedicineInfo;
  onClose?: () => void;
}

export const MedicineInfoPanel: React.FC<MedicineInfoPanelProps> = ({ medicine, onClose }) => {
  return (
    <Card
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '2px solid var(--color-primary)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)', textTransform: 'uppercase' }}>
              Verified Medicine Information
            </span>
            <Badge variant="info" size="sm">AR Live Panel</Badge>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
            {medicine.name}
          </h3>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Generic: <strong>{medicine.genericName}</strong> • Strength: <strong>{medicine.strength}</strong>
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <Badge variant="success">Match Confirmed</Badge>
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>
            {medicine.category}
          </span>
        </div>
      </div>

      {/* Indications */}
      <div>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <CheckCircle2 size={15} color="var(--color-primary)" /> Approved Indications / General Uses
        </h4>
        <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
          {medicine.indications.map((ind, i) => (
            <li key={i}>{ind}</li>
          ))}
        </ul>
      </div>

      {/* Precautions */}
      <div style={{ backgroundColor: 'var(--color-attention-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(148, 98, 0, 0.2)' }}>
        <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-attention)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <AlertCircle size={15} /> Key Precautions & Clinical Warnings
        </h4>
        <ul style={{ paddingLeft: '1.25rem', fontSize: '0.75rem', color: 'var(--color-text-main)', lineHeight: 1.45 }}>
          {medicine.precautions.map((prec, i) => (
            <li key={i}>{prec}</li>
          ))}
        </ul>
      </div>

      {/* Side Effects */}
      <div>
        <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
          Possible Common Side Effects
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {medicine.sideEffects.map((se, i) => (
            <span key={i} style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
              {se}
            </span>
          ))}
        </div>
      </div>

      {/* Provenance source footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '0.625rem', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <ShieldCheck size={12} color="var(--color-success)" /> Reference Source: {medicine.verifiedSource}
        </span>
        <span>Manufacturer: {medicine.manufacturer}</span>
      </div>
    </Card>
  );
};
