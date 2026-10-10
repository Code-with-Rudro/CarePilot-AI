import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert } from '../../components/ui/alert';
import { Modal } from '../../components/ui/modal';
import { useAuth } from '../../hooks/use-auth';
import { 
  ShieldCheck, 
  Download, 
  Trash2, 
  Lock, 
  Database, 
  Check, 
  ExternalLink,
  Sliders,
  FileSpreadsheet
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [dataSharingEnabled, setDataSharingEnabled] = useState(false);
  const [retentionMonths, setRetentionMonths] = useState(12);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 4000);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      {/* Privacy Architecture Notice */}
      <Card style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
          <ShieldCheck size={22} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
            Privacy, Consent & Data Ownership
          </h3>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Your medical records, diagnostic observations, and prescription details belong exclusively to you. Under Altrix Labs privacy architecture, records are encrypted at rest, and vector embeddings are filtered strictly by your authenticated user session to prevent unauthorized cross-tenant retrieval.
        </p>
      </Card>

      {/* Account Profile Details */}
      <Card style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={18} color="var(--color-primary)" /> Authenticated Profile & ABHA Identity
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block' }}>Name</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{currentUser.name}</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block' }}>Email</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{currentUser.email}</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block' }}>Role</span>
            <Badge variant="info">{currentUser.role.toUpperCase()}</Badge>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'block' }}>ABHA ID Status</span>
            <span style={{ fontWeight: 600, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Check size={14} /> {currentUser.abhaId || 'Configured in Demo'}
            </span>
          </div>
        </div>
      </Card>

      {/* Retention and Sharing Preferences */}
      <Card style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={18} color="var(--color-primary)" /> Data Retention & Third-Party Sharing
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)', display: 'block' }}>
                Third-Party Analytics & Model Training
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Zero data is used to train public models. Health records remain isolated.
              </span>
            </div>
            <input
              type="checkbox"
              checked={dataSharingEnabled}
              onChange={(e) => setDataSharingEnabled(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)', display: 'block' }}>
                Diagnostic History Retention
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Automatically archive lab observations after period
              </span>
            </div>
            <select
              value={retentionMonths}
              onChange={(e) => setRetentionMonths(Number(e.target.value))}
              style={{
                padding: '0.375rem 0.625rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                fontSize: '0.8125rem',
              }}
            >
              <option value={6}>6 Months</option>
              <option value={12}>1 Year (Recommended)</option>
              <option value={36}>3 Years</option>
              <option value={120}>Indefinite</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Export Records (FHIR-Inspired) */}
      <Card style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} color="var(--color-primary)" /> Export Health Records & Structured Facts
        </h4>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Download a complete portable bundle of your verified medical parameters, prescriptions, and health summaries in FHIR-compatible JSON format.
        </p>

        {exportComplete && (
          <Alert type="success" title="Export Ready">
            Your encrypted health record bundle (carepilot_patient_bundle.json) has been compiled and saved.
          </Alert>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportData}
          isLoading={isExporting}
          leftIcon={<FileSpreadsheet size={15} />}
        >
          {isExporting ? 'Packaging FHIR Bundle...' : 'Export Complete Patient Record (JSON)'}
        </Button>
      </Card>

      {/* Danger Zone: Account & Document Deletion */}
      <Card style={{ padding: '1.5rem', border: '1px solid rgba(180, 35, 24, 0.3)' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-critical)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trash2 size={18} /> Danger Zone: Delete Records & Data
        </h4>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Permanently delete uploaded medical scans, extracted parameters, vector index chunks, and conversation history. This action cannot be reversed.
        </p>

        <Button
          variant="danger"
          size="sm"
          onClick={() => setIsDeleteModalOpen(true)}
          leftIcon={<Trash2 size={15} />}
        >
          Request Data Purge & Deletion
        </Button>
      </Card>

      {/* Deletion Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Data Purge Request"
        description="This will purge all uploaded PDFs, extracted lab values, and conversation history."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Alert type="critical">
            This action is permanent and unrecoverable. All vector embeddings will be pruned from the index.
          </Alert>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
            To confirm, please type <strong>DELETE</strong> below:
          </p>
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Type DELETE"
            style={{
              padding: '0.625rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={deleteConfirmation !== 'DELETE'}
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteConfirmation('');
                alert('Purge request submitted. In local demo mode, session state will reset on refresh.');
              }}
            >
              Permanently Purge Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
