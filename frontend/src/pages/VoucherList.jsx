import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { VoucherTable } from '../components/VoucherTable';
import { SignaturePadModal } from '../components/SignaturePadModal';
import { Modal } from '../components/Modal';
import {
  PlusCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const VoucherList = ({
  initialStatus = '',
  onViewVoucher,
  onEditVoucher,
  onCreateVoucher,
}) => {
  const { user, isEmployee, isDirector, isAccounts } = useAuth();

  const [filters, setFilters] = useState({
    search: '',
    status: initialStatus,
    department: '',
    expense_category: '',
    voucher_number: '',
    employee_name: '',
    date_from: '',
    date_to: '',
    min_amount: '',
    max_amount: '',
    sortBy: 'id',
    order: 'DESC',
    page: 1,
    limit: 15,
  });

  const [data, setData] = useState({ vouchers: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals for Director Quick Actions
  const [selectedVoucherForApproval, setSelectedVoucherForApproval] = useState(null);
  const [selectedVoucherForRejection, setSelectedVoucherForRejection] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getVouchers(filters);
      if (res.success) {
        setData({
          vouchers: res.vouchers,
          total: res.total,
          totalPages: res.totalPages || 1,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: initialStatus,
      department: '',
      expense_category: '',
      voucher_number: '',
      employee_name: '',
      date_from: '',
      date_to: '',
      min_amount: '',
      max_amount: '',
      sortBy: 'id',
      order: 'DESC',
      page: 1,
      limit: 15,
    });
  };

  const handleDeleteDraft = async (id, voucherNumber) => {
    if (!window.confirm(`Are you sure you want to delete draft voucher ${voucherNumber}?`)) {
      return;
    }
    try {
      const res = await api.deleteVoucher(id);
      if (res.success) {
        fetchVouchers();
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Director quick approve
  const handleApproveSignature = async (sigResult) => {
    if (!selectedVoucherForApproval) return;
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

      const res = await api.approveVoucher(selectedVoucherForApproval.id, {
        signature_url: finalUrl,
        signatureData: finalData,
      });

      if (res.success) {
        setSelectedVoucherForApproval(null);
        fetchVouchers();
      }
    } catch (err) {
      alert('Approval error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Director quick reject
  const handleConfirmReject = async () => {
    if (!selectedVoucherForRejection) return;
    if (!rejectionReason.trim()) {
      alert('Validation error: Rejection reason is mandatory.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.rejectVoucher(selectedVoucherForRejection.id, {
        rejection_reason: rejectionReason.trim(),
      });
      if (res.success) {
        setSelectedVoucherForRejection(null);
        setRejectionReason('');
        fetchVouchers();
      }
    } catch (err) {
      alert('Rejection error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getPageTitle = () => {
    if (initialStatus === 'Submitted' && isDirector) return 'Pending Approvals Queue';
    if (isEmployee) return 'My Expense Vouchers';
    if (isDirector) return 'Organization Expense Vouchers';
    if (isAccounts) return 'Accounts Vouchers Repository';
    return 'Expense Vouchers';
  };

  const getPageSubtitle = () => {
    if (initialStatus === 'Submitted' && isDirector)
      return 'Vouchers submitted by staff requiring Director review and signature.';
    if (isEmployee)
      return 'Search, filter, track status, and manage your reimbursement submissions.';
    return 'Comprehensive repository of all company expense claims with multi-parameter search & sorting.';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Title & Action header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            {getPageTitle()}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {getPageSubtitle()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchVouchers}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.6rem 0.85rem' }}
            title="Refresh List"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          {isEmployee && (
            <button
              onClick={onCreateVoucher}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.6rem 1rem' }}
            >
              <PlusCircle size={16} />
              <span>New Voucher</span>
            </button>
          )}
        </div>
      </div>

      {/* Bonus Search & Filter Component */}
      <SearchFilterBar
        filters={filters}
        onFilterChange={(newFilters) => setFilters({ ...newFilters, page: 1 })}
        onReset={handleResetFilters}
        showEmployeeFilter={!isEmployee}
      />

      {/* Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{data.vouchers.length}</strong> of <strong>{data.total}</strong> total vouchers
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading expense vouchers...
        </div>
      ) : (
        <VoucherTable
          vouchers={data.vouchers}
          onView={onViewVoucher}
          onEdit={onEditVoucher}
          onDelete={handleDeleteDraft}
          onApprove={(v) => setSelectedVoucherForApproval(v)}
          onReject={(v) => setSelectedVoucherForRejection(v)}
          showEmployeeCol={!isEmployee}
          currentRole={user?.role}
        />
      )}

      {/* Pagination Controls */}
      {data.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button
            className="btn btn-secondary"
            disabled={filters.page <= 1}
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Page {filters.page} of {data.totalPages}
          </span>

          <button
            className="btn btn-secondary"
            disabled={filters.page >= data.totalPages}
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Director Approve Modal */}
      <SignaturePadModal
        isOpen={!!selectedVoucherForApproval}
        onClose={() => setSelectedVoucherForApproval(null)}
        onConfirmSignature={handleApproveSignature}
        title={`Authorize Voucher: ${selectedVoucherForApproval?.voucher_number}`}
        description="Director signature is mandatory before authorizing this expense voucher."
        defaultSignatureUrl={user?.signature_url}
      />

      {/* Director Reject Modal */}
      <Modal
        isOpen={!!selectedVoucherForRejection}
        onClose={() => setSelectedVoucherForRejection(null)}
        title={`Decline Voucher: ${selectedVoucherForRejection?.voucher_number}`}
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Rejection reason is mandatory so the employee can review and address the remarks.
          </p>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Rejection Remarks *
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State clear reasons for rejection..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedVoucherForRejection(null)}
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
