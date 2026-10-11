import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { VoucherTable } from '../components/VoucherTable';
import {
  FileText,
  FileEdit,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';

export const EmployeeDashboard = ({ onNavigate, onViewVoucher, onEditVoucher, onDeleteVoucher }) => {
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
      setError(err.message || 'Failed to load dashboard metrics');
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
        Loading your expense dashboard...
      </div>
    );
  }

  const stats = data?.stats || {
    totalVouchers: 0,
    draftVouchers: 0,
    pendingApproval: 0,
    approvedVouchers: 0,
    rejectedVouchers: 0,
    totalAmountClaimed: 0,
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome & Actions Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Track and manage your reimbursement requests across {user?.department || 'your department'}.
          </p>
        </div>

        <button
          onClick={() => onNavigate('create')}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.4rem' }}
        >
          <PlusCircle size={18} />
          <span>Create Expense Voucher</span>
        </button>
      </div>

      {/* Required Section 8 Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
        }}
      >
        <StatCard
          title="Total Vouchers"
          value={stats.totalVouchers}
          subtitle="All created claims"
          icon={FileText}
          colorScheme="blue"
          onClick={() => onNavigate('vouchers')}
        />

        <StatCard
          title="Draft Vouchers"
          value={stats.draftVouchers}
          subtitle="Editable & unsubmitted"
          icon={FileEdit}
          colorScheme="slate"
          onClick={() => onNavigate('vouchers')}
        />

        <StatCard
          title="Pending Approval"
          value={stats.pendingApproval}
          subtitle="Awaiting Director review"
          icon={Clock}
          colorScheme="amber"
          onClick={() => onNavigate('vouchers')}
        />

        <StatCard
          title="Approved Vouchers"
          value={stats.approvedVouchers}
          subtitle="Passed to Accounts"
          icon={CheckCircle2}
          colorScheme="emerald"
          onClick={() => onNavigate('vouchers')}
        />

        <StatCard
          title="Rejected Vouchers"
          value={stats.rejectedVouchers}
          subtitle="Requires revision"
          icon={XCircle}
          colorScheme="rose"
          onClick={() => onNavigate('vouchers')}
        />

        <StatCard
          title="Total Amount Claimed"
          value={`$${stats.totalAmountClaimed.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Total reimbursement value"
          icon={DollarSign}
          colorScheme="purple"
        />
      </div>

      {/* Recent Activity Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Expense Claims
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Your latest submitted or drafted expense vouchers
            </p>
          </div>

          <button
            onClick={() => onNavigate('vouchers')}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <VoucherTable
          vouchers={data?.recentVouchers || []}
          onView={onViewVoucher}
          onEdit={onEditVoucher}
          onDelete={onDeleteVoucher}
          showEmployeeCol={false}
          currentRole="employee"
        />
      </div>
    </div>
  );
};
