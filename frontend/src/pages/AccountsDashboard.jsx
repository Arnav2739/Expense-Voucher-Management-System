import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { VoucherTable } from '../components/VoucherTable';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  ArrowRight,
  Calculator,
  Printer,
} from 'lucide-react';

export const AccountsDashboard = ({ onNavigate, onViewVoucher }) => {
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
      setError(err.message || 'Failed to load accounts metrics');
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
        Loading accounts overview...
      </div>
    );
  }

  const stats = data?.stats || {
    totalVouchers: 0,
    pendingApproval: 0,
    approvedVouchers: 0,
    rejectedVouchers: 0,
    totalApprovedExpenseAmount: 0,
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Accounts & Finance Oversight
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Monitor organizational expenditures, verify signatures, and disburse approved claims.
          </p>
        </div>

        <button
          onClick={() => onNavigate('vouchers')}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.4rem' }}
        >
          <FileText size={18} />
          <span>Browse All Vouchers</span>
        </button>
      </div>

      {/* Section 8 Accounts Dashboard Cards */}
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
          subtitle="All organization claims"
          icon={FileText}
          colorScheme="blue"
          onClick={() => onNavigate('vouchers')}
        />

        <StatCard
          title="Pending Approval"
          value={stats.pendingApproval}
          subtitle="Currently with Director"
          icon={Clock}
          colorScheme="amber"
          onClick={() => onNavigate('vouchers')}
        />

        <StatCard
          title="Approved Vouchers"
          value={stats.approvedVouchers}
          subtitle="Cleared for disbursement"
          icon={CheckCircle2}
          colorScheme="emerald"
          onClick={() => onNavigate('vouchers')}
        />

        <StatCard
          title="Rejected Vouchers"
          value={stats.rejectedVouchers}
          subtitle="Declined reimbursement"
          icon={XCircle}
          colorScheme="rose"
          onClick={() => onNavigate('vouchers')}
        />

        <StatCard
          title="Total Approved Amount"
          value={`$${stats.totalApprovedExpenseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Ready for payout"
          icon={DollarSign}
          colorScheme="purple"
        />
      </div>

      {/* Recent Approved Vouchers ready for payout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Approved Vouchers
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Approved by Director, eligible for disbursement processing and printing
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
          vouchers={data?.recentApprovedVouchers || []}
          onView={onViewVoucher}
          showEmployeeCol={true}
          currentRole="accounts"
        />
      </div>
    </div>
  );
};
