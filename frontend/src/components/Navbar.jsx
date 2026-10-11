import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Building, ShieldCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  const roleLabels = {
    employee: { text: 'Employee', bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' },
    director: { text: 'Director (Admin)', bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' },
    accounts: { text: 'Accounts Team', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399' },
  };

  const roleInfo = roleLabels[user?.role] || roleLabels.employee;

  return (
    <header
      className="no-print"
      style={{
        height: '68px',
        backgroundColor: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Brand Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1rem',
            boxShadow: '0 4px 12px var(--accent-glow)',
          }}
        >
          EV
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff', letterSpacing: '-0.01em' }}>
            Expense Voucher System
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            ABC Company • Internal Portal
          </div>
        </div>
      </div>

      {/* User Info & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Role Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: roleInfo.bg,
            color: roleInfo.color,
            fontSize: '0.75rem',
            fontWeight: 600,
            border: `1px solid ${roleInfo.color}33`,
          }}
        >
          <ShieldCheck size={14} />
          <span>{roleInfo.text}</span>
        </div>

        {/* User profile capsule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {user?.department}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          title="Sign Out"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
