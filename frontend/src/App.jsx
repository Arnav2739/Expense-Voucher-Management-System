import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { DirectorDashboard } from './pages/DirectorDashboard';
import { AccountsDashboard } from './pages/AccountsDashboard';
import { VoucherCreate } from './pages/VoucherCreate';
import { VoucherEdit } from './pages/VoucherEdit';
import { VoucherDetail } from './pages/VoucherDetail';
import { VoucherList } from './pages/VoucherList';
import { api } from './services/api';

const MainLayout = () => {
  const { user, isAuthenticated, loading, isEmployee, isDirector, isAccounts } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending count periodically or on view changes for director badge
  const refreshPendingCount = async () => {
    if (isDirector) {
      try {
        const stats = await api.getDashboardStats();
        if (stats.success && stats.stats) {
          setPendingCount(stats.stats.pendingApprovalCount || 0);
        }
      } catch (err) {
        console.error('Failed to load pending count:', err);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshPendingCount();
    }
  }, [isAuthenticated, isDirector, currentView]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-main)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(59, 130, 246, 0.2)',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span>Initializing Expense Voucher System...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const navigateTo = (view, voucherId = null) => {
    setSelectedVoucherId(voucherId);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => navigateTo(view)}
          pendingCount={pendingCount}
        />

        <main
          style={{
            flex: 1,
            padding: '2rem',
            maxWidth: '1400px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* DASHBOARD VIEW */}
          {currentView === 'dashboard' && (
            <>
              {isEmployee && (
                <EmployeeDashboard
                  onNavigate={navigateTo}
                  onViewVoucher={(id) => navigateTo('detail', id)}
                  onEditVoucher={(id) => navigateTo('edit', id)}
                  onDeleteVoucher={async (id, num) => {
                    if (window.confirm(`Delete draft ${num}?`)) {
                      await api.deleteVoucher(id);
                      refreshPendingCount();
                      navigateTo('dashboard');
                    }
                  }}
                />
              )}
              {isDirector && (
                <DirectorDashboard
                  onNavigate={navigateTo}
                  onViewVoucher={(id) => navigateTo('detail', id)}
                  onApproveVoucher={(v) => navigateTo('detail', v.id)}
                  onRejectVoucher={(v) => navigateTo('detail', v.id)}
                />
              )}
              {isAccounts && (
                <AccountsDashboard
                  onNavigate={navigateTo}
                  onViewVoucher={(id) => navigateTo('detail', id)}
                />
              )}
            </>
          )}

          {/* CREATE VOUCHER (Employee only) */}
          {currentView === 'create' && isEmployee && (
            <VoucherCreate
              onBack={() => navigateTo('dashboard')}
              onCreated={(newId) => {
                refreshPendingCount();
                navigateTo('detail', newId);
              }}
            />
          )}

          {/* EDIT DRAFT VOUCHER (Employee only) */}
          {currentView === 'edit' && isEmployee && selectedVoucherId && (
            <VoucherEdit
              voucherId={selectedVoucherId}
              onBack={() => navigateTo('detail', selectedVoucherId)}
              onSaved={(savedId) => {
                refreshPendingCount();
                navigateTo('detail', savedId);
              }}
              onDeleted={() => {
                refreshPendingCount();
                navigateTo('vouchers');
              }}
            />
          )}

          {/* VOUCHER DETAIL */}
          {currentView === 'detail' && selectedVoucherId && (
            <VoucherDetail
              voucherId={selectedVoucherId}
              onBack={() => navigateTo('vouchers')}
              onEditDraft={(id) => navigateTo('edit', id)}
              onDeleted={() => {
                refreshPendingCount();
                navigateTo('vouchers');
              }}
              onReload={refreshPendingCount}
            />
          )}

          {/* MY VOUCHERS / ALL VOUCHERS */}
          {currentView === 'vouchers' && (
            <VoucherList
              initialStatus=""
              onViewVoucher={(id) => navigateTo('detail', id)}
              onEditVoucher={(id) => navigateTo('edit', id)}
              onCreateVoucher={() => navigateTo('create')}
            />
          )}

          {/* PENDING APPROVALS QUEUE (Director only) */}
          {currentView === 'pending-approvals' && isDirector && (
            <VoucherList
              initialStatus="Submitted"
              onViewVoucher={(id) => navigateTo('detail', id)}
              onEditVoucher={(id) => navigateTo('edit', id)}
              onCreateVoucher={() => navigateTo('create')}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
