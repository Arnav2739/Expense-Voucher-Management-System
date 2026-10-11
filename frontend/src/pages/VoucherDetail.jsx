import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { VoucherStatusBadge } from '../components/VoucherStatusBadge';
import { SignaturePadModal } from '../components/SignaturePadModal';
import { Modal } from '../components/Modal';
import { PrintableVoucher } from '../components/PrintableVoucher';
import {
  ArrowLeft,
  Calendar,
  Building,
  User,
  DollarSign,
  Tag,
  CheckCircle2,
  XCircle,
  FileEdit,
  Trash2,
  Send,
  Printer,
  History,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export const VoucherDetail = ({
  voucherId,
  onBack,
  onEditDraft,
  onDeleted,
  onReload,
}) => {
  const { user, isEmployee, isDirector, isAccounts } = useAuth();
  const [voucher, setVoucher] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isEmployeeSubmitModalOpen, setIsEmployeeSubmitModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [showPrintView, setShowPrintView] = useState(false);

  const fetchVoucher = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getVoucher(voucherId);
      if (res.success) {
        setVoucher(res.voucher);
        setAuditLogs(res.auditLogs || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load voucher details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucher();
  }, [voucherId]);

  // Employee: Submit Draft with signature
  const handleEmployeeSubmitSignature = async (sigResult) => {
    setActionLoading(true);
    try {
      let finalUrl = null;
      let finalData = null;

      if (sigResult.type === 'base64') {
        finalData = sigResult.data;
      } else if (sigResult.type === 'file') {
        const uploadRes = await api.uploadSignature(sigResult.file);
        finalUrl = uploadRes.signatureUrl;
      } else if (sigResult.type === 'url') {
        finalUrl = sigResult.url;
      }

      const res = await api.submitVoucher(voucher.id, {
        signature_url: finalUrl,
        signatureData: finalData,
      });

      if (res.success) {
        await fetchVoucher();
        if (onReload) onReload();
      }
    } catch (err) {
      alert('Submission failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Employee: Delete Draft
  const handleDeleteDraft = async () => {
    if (!window.confirm(`Are you sure you want to delete draft voucher ${voucher.voucher_number}?`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.deleteVoucher(voucher.id);
      if (res.success) {
        if (onDeleted) onDeleted();
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Director: Approve with signature
  const handleApproveSignature = async (sigResult) => {
    setActionLoading(true);
    try {
      let finalUrl = null;
      let finalData = null;

      if (sigResult.type === 'base64') {
        finalData = sigResult.data;
      } else if (sigResult.type === 'file') {
        const uploadRes = await api.uploadSignature(sigResult.file);
        finalUrl = uploadRes.signatureUrl;
      } else if (sigResult.type === 'url') {
        finalUrl = sigResult.url;
      }

      const res = await api.approveVoucher(voucher.id, {
        signature_url: finalUrl,
        signatureData: finalData,
      });

      if (res.success) {
        await fetchVoucher();
        if (onReload) onReload();
      }
    } catch (err) {
      alert('Approval failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Director: Reject with reason
  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectionError('Validation error: Rejection reason is mandatory.');
      return;
    }
    setRejectionError('');
    setActionLoading(true);
    try {
      const res = await api.rejectVoucher(voucher.id, {
        rejection_reason: rejectionReason.trim(),
      });
      if (res.success) {
        setIsRejectModalOpen(false);
        setRejectionReason('');
        await fetchVoucher();
        if (onReload) onReload();
      }
    } catch (err) {
      setRejectionError(err.message || 'Failed to reject voucher.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading voucher details...</div>;
  }

  if (error || !voucher) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#f87171', marginBottom: '1rem' }}>{error || 'Voucher not found'}</p>
        <button onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={16} /> Return Back
        </button>
      </div>
    );
  }

  const isDraft = voucher.status === 'Draft';
  const isSubmitted = voucher.status === 'Submitted';
  const isApproved = voucher.status === 'Approved';
  const isRejected = voucher.status === 'Rejected';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Action Nav Bar */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <button
          onClick={onBack}
          className="btn btn-secondary"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to List</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Toggle View mode */}
          <button
            onClick={() => setShowPrintView(!showPrintView)}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            {showPrintView ? (
              <>
                <FileText size={15} />
                <span>Standard View</span>
              </>
            ) : (
              <>
                <Printer size={15} />
                <span>Official Print / PDF Slip</span>
              </>
            )}
          </button>

          {/* Employee Actions */}
          {isEmployee && isDraft && (
            <>
              <button
                onClick={() => onEditDraft(voucher.id)}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
              >
                <FileEdit size={15} />
                <span>Edit Draft</span>
              </button>

              <button
                onClick={handleDeleteDraft}
                className="btn btn-danger"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>

              <button
                onClick={() => setIsEmployeeSubmitModalOpen(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
              >
                <Send size={15} />
                <span>Submit for Approval</span>
              </button>
            </>
          )}

          {/* Director Actions */}
          {isDirector && isSubmitted && (
            <>
              <button
                onClick={() => setIsRejectModalOpen(true)}
                className="btn btn-danger"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
              >
                <XCircle size={15} />
                <span>Reject Voucher</span>
              </button>

              <button
                onClick={() => setIsApproveModalOpen(true)}
                className="btn btn-success"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
              >
                <CheckCircle2 size={15} />
                <span>Approve with Signature</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content: Printable Slip OR Standard Interactive View */}
      {showPrintView ? (
        <PrintableVoucher voucher={voucher} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Card */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '6px' }}>
                  <h1
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-primary)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {voucher.voucher_number}
                  </h1>
                  <VoucherStatusBadge status={voucher.status} size="lg" />
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {voucher.expense_title}
                </h2>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Total Claimed Amount
                </span>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: '#ffffff',
                    marginTop: '2px',
                  }}
                >
                  ${Number(voucher.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Rejection notice box if rejected */}
            {isRejected && voucher.rejection_reason && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                }}
              >
                <AlertTriangle size={20} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f87171' }}>
                    Voucher Declined by Director
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#fecaca', marginTop: '4px' }}>
                    <strong>Reason:</strong> {voucher.rejection_reason}
                  </p>
                </div>
              </div>
            )}

            {/* Grid of basic information & employee information */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Department</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {voucher.department_name}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expense Category</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {voucher.expense_category}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expense Incurred Date</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {voucher.expense_date}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Voucher Filing Date</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {voucher.voucher_date}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Claimant Employee</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {voucher.employee_name}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Employee ID</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {voucher.employee_id || 'N/A'}
                </div>
              </div>
            </div>

            {/* Description */}
            {voucher.expense_description && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expense Justification / Notes</span>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.6 }}>
                  {voucher.expense_description}
                </p>
              </div>
            )}
          </div>

          {/* Signatures Section */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Employee Signature Card */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Employee Authorization
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mandatory for submission</span>
              </div>

              <div
                style={{
                  height: '110px',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-subtle)',
                  padding: '8px',
                }}
              >
                {voucher.employee_signature_url ? (
                  <img
                    src={voucher.employee_signature_url}
                    alt="Employee Signature"
                    style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    Signature not attached (Required before submission)
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Signed by: <strong>{voucher.employee_name}</strong>
              </div>
            </div>

            {/* Director Approval Signature Card */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Director Authorization
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mandatory for approval</span>
              </div>

              <div
                style={{
                  height: '110px',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-subtle)',
                  padding: '8px',
                }}
              >
                {voucher.director_signature_url ? (
                  <img
                    src={voucher.director_signature_url}
                    alt="Director Signature"
                    style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }}
                  />
                ) : isRejected ? (
                  <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 700 }}>
                    DECLINED BY DIRECTOR
                  </span>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    Awaiting Director Review & Signature
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Authorized by:{' '}
                <strong>{voucher.director_name || (isSubmitted ? 'Pending Director Approval' : 'None')}</strong>
                {voucher.approval_date && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Approval Date: {voucher.approval_date.split('T')[0]}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <History size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Voucher Audit Trail & Lifecycle History
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid var(--border-subtle)', paddingLeft: '1.25rem', marginLeft: '0.5rem' }}>
              {auditLogs.map((log) => (
                <div key={log.id} style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.65rem',
                      top: '4px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor:
                        log.action === 'APPROVED'
                          ? '#10b981'
                          : log.action === 'REJECTED'
                          ? '#ef4444'
                          : log.action === 'SUBMITTED'
                          ? '#f59e0b'
                          : 'var(--accent-primary)',
                      border: '2px solid #111827',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {log.action}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {log.timestamp}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    <strong>{log.performed_by_name}</strong> ({log.performed_by_role}): {log.notes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Employee Submit Signature Modal */}
      <SignaturePadModal
        isOpen={isEmployeeSubmitModalOpen}
        onClose={() => setIsEmployeeSubmitModalOpen(false)}
        onConfirmSignature={handleEmployeeSubmitSignature}
        title="Employee Signature Authorization"
        description="Attach signature before submitting this voucher for Director review."
        defaultSignatureUrl={user?.signature_url}
      />

      {/* Director Approve Signature Modal */}
      <SignaturePadModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirmSignature={handleApproveSignature}
        title="Director Approval Signature"
        description="Director signature is mandatory before authorizing this expense voucher."
        defaultSignatureUrl={user?.signature_url}
      />

      {/* Director Reject Reason Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Decline Expense Voucher"
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            According to business validation rules, a clear <strong>Rejection Reason is mandatory</strong> when declining a voucher so the employee can address the issue.
          </p>

          {rejectionError && (
            <div style={{ color: '#f87171', fontSize: '0.8rem' }}>
              {rejectionError}
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Rejection Reason & Remarks *
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Missing official GST invoice receipt. Please attach and resubmit."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmReject}
              disabled={actionLoading}
            >
              <XCircle size={16} />
              <span>Confirm Rejection</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
