import React from 'react';
import { Clock, CheckCircle2, XCircle, FileEdit } from 'lucide-react';

const statusConfig = {
  Draft: {
    bg: 'var(--status-draft-bg)',
    color: 'var(--status-draft-text)',
    border: 'var(--status-draft-border)',
    icon: FileEdit,
    label: 'Draft',
  },
  Submitted: {
    bg: 'var(--status-submitted-bg)',
    color: 'var(--status-submitted-text)',
    border: 'var(--status-submitted-border)',
    icon: Clock,
    label: 'Pending Approval',
  },
  Approved: {
    bg: 'var(--status-approved-bg)',
    color: 'var(--status-approved-text)',
    border: 'var(--status-approved-border)',
    icon: CheckCircle2,
    label: 'Approved',
  },
  Rejected: {
    bg: 'var(--status-rejected-bg)',
    color: 'var(--status-rejected-text)',
    border: 'var(--status-rejected-border)',
    icon: XCircle,
    label: 'Rejected',
  },
};

export const VoucherStatusBadge = ({ status, size = 'md' }) => {
  const config = statusConfig[status] || statusConfig.Draft;
  const Icon = config.icon;

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '0.25rem' : '0.4rem',
        padding: isSmall ? '0.2rem 0.55rem' : isLarge ? '0.4rem 0.9rem' : '0.25rem 0.75rem',
        fontSize: isSmall ? '0.75rem' : isLarge ? '0.9rem' : '0.8125rem',
        fontWeight: 600,
        borderRadius: '9999px',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={isSmall ? 12 : isLarge ? 16 : 14} />
      <span>{config.label}</span>
    </span>
  );
};
