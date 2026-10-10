export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Not recorded';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return 'Not recorded';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getDocumentTypeLabel(type: string): string {
  switch (type) {
    case 'lab_report': return 'Diagnostic Lab Report';
    case 'prescription': return 'Medical Prescription';
    case 'discharge_summary': return 'Hospital Discharge Summary';
    case 'imaging_report': return 'Imaging / Radiology Report';
    case 'diagnostic': return 'Diagnostic Evaluation';
    default: return 'Medical Record';
  }
}

export function getStatusBadgeVariant(status: string): 'success' | 'attention' | 'critical' | 'info' | 'default' {
  switch (status) {
    case 'processed':
    case 'confirmed':
    case 'taken':
      return 'success';
    case 'needs_review':
    case 'unverified':
    case 'pending':
    case 'reading':
    case 'extracting':
      return 'attention';
    case 'failed':
    case 'rejected':
    case 'skipped':
      return 'critical';
    case 'uploaded':
    case 'snoozed':
      return 'info';
    default:
      return 'default';
  }
}
