import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { VoucherTable } from '../components/VoucherTable';
import {
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const DirectorDashboard = ({
  onNavigate,
  onViewVoucher,
  onApproveVoucher,
  onRejectVoucher,
}) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load director dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading director dashboard...
      </div>
    );
  }

  const stats = data?.stats || {
    pendingApprovalCount: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalPendingAmount: 0,
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Director Approval Hub
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Review, sign, and authorize expense reimbursement claims across ABC Company.
          </p>
        </div>

        <button
          onClick={() => onNavigate('pending-approvals')}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.4rem' }}
        >
          <Clock size={18} />
          <span>Review Pending ({stats.pendingApprovalCount})</span>
        </button>
      </div>

      {/* Section 8 Director Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <StatCard
          title="Pending Approval Count"
          value={stats.pendingApprovalCount}
          subtitle="Awaiting your authorization"
          icon={Clock}
          colorScheme="amber"
          onClick={() => onNavigate('pending-approvals')}
        />

        <StatCard
          title="Approved Today"
          value={stats.approvedToday}
          subtitle="Signed & authorized today"
          icon={CheckCircle2}
          colorScheme="emerald"
        />

        <StatCard
          title="Rejected Today"
          value={stats.rejectedToday}
          subtitle="Declined with reason today"
          icon={XCircle}
          colorScheme="rose"
        />

        <StatCard
          title="Total Pending Amount"
          value={`$${stats.totalPendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Capital awaiting clearance"
          icon={DollarSign}
          colorScheme="purple"
        />
      </div>

      {/* Actionable Pending Approvals Queue */}
      {data?.pendingApprovalsList && data.pendingApprovalsList.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} color="#fbbf24" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24' }}>
                Action Required: Pending Vouchers ({data.pendingApprovalsList.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('pending-approvals')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              <span>View Full Queue</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <VoucherTable
            vouchers={data.pendingApprovalsList}
            onView={onViewVoucher}
            onApprove={onApproveVoucher}
            onReject={onRejectVoucher}
            showEmployeeCol={true}
            currentRole="director"
          />
        </div>
      )}

      {/* Recent Voucher Activity across the organization */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Voucher Activity
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Latest transactions across all departments
            </p>
          </div>

          <button
            onClick={() => onNavigate('vouchers')}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}
          >
            <span>View All Vouchers</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <VoucherTable
          vouchers={data?.recentActivity || []}
          onView={onViewVoucher}
          onApprove={onApproveVoucher}
          onReject={onRejectVoucher}
          showEmployeeCol={true}
          currentRole="director"
        />
      </div>
    </div>
  );
};
