import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileSpreadsheet,
  ClockAlert,
  Files,
  UserCheck,
} from 'lucide-react';

export const Sidebar = ({ currentView, onNavigate, pendingCount = 0 }) => {
  const { user, isEmployee, isDirector, isAccounts } = useAuth();

  return (
    <aside
      className="no-print"
      style={{
        width: '240px',
        backgroundColor: 'rgba(17, 24, 39, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.25rem 0.75rem',
        gap: '0.5rem',
        minHeight: 'calc(100vh - 68px)',
      }}
    >
      <div style={{ padding: '0 0.5rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Navigation Menu
      </div>

      {/* DASHBOARD (Common to all roles) */}
      <button
        onClick={() => onNavigate('dashboard')}
        className={`btn ${currentView === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
        style={{
          justifyContent: 'flex-start',
          width: '100%',
          padding: '0.65rem 0.85rem',
          fontSize: '0.85rem',
        }}
      >
        <LayoutDashboard size={18} />
        <span>Dashboard</span>
      </button>

      {/* ================= EMPLOYEE VIEWS ================= */}
      {isEmployee && (
        <>
          <button
            onClick={() => onNavigate('create')}
            className={`btn ${currentView === 'create' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              padding: '0.65rem 0.85rem',
              fontSize: '0.85rem',
            }}
          >
            <PlusCircle size={18} />
            <span>Create Voucher</span>
          </button>

          <button
            onClick={() => onNavigate('vouchers')}
            className={`btn ${currentView === 'vouchers' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              padding: '0.65rem 0.85rem',
              fontSize: '0.85rem',
            }}
          >
            <FileSpreadsheet size={18} />
            <span>My Vouchers</span>
          </button>
        </>
      )}

      {/* ================= DIRECTOR VIEWS ================= */}
      {isDirector && (
        <>
          <button
            onClick={() => onNavigate('pending-approvals')}
            className={`btn ${currentView === 'pending-approvals' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.65rem 0.85rem',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClockAlert size={18} />
              <span>Pending Approvals</span>
            </div>
            {pendingCount > 0 && (
              <span
                style={{
                  backgroundColor: '#f59e0b',
                  color: '#000000',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                }}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('vouchers')}
            className={`btn ${currentView === 'vouchers' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              padding: '0.65rem 0.85rem',
              fontSize: '0.85rem',
            }}
          >
            <Files size={18} />
            <span>All Vouchers</span>
          </button>
        </>
      )}

      {/* ================= ACCOUNTS TEAM VIEWS ================= */}
      {isAccounts && (
        <>
          <button
            onClick={() => onNavigate('vouchers')}
            className={`btn ${currentView === 'vouchers' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              padding: '0.65rem 0.85rem',
              fontSize: '0.85rem',
            }}
          >
            <Files size={18} />
            <span>All Vouchers</span>
          </button>
        </>
      )}

      {/* Role Notice Info Card at bottom */}
      <div
        style={{
          marginTop: 'auto',
          padding: '0.85rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
          <UserCheck size={14} /> Current Access
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {isEmployee && 'Create, draft, and track personal reimbursement claims.'}
          {isDirector && 'Review pending voucher requests, approve with signature, or reject.'}
          {isAccounts && 'Monitor company-wide expenses and process approved disbursements.'}
        </p>
      </div>
    </aside>
  );
};
