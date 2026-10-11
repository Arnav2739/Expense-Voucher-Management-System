import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'blue',
  onClick,
}) => {
  const schemes = {
    blue: {
      gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.05) 100%)',
      border: 'rgba(59, 130, 246, 0.25)',
      iconBg: 'rgba(59, 130, 246, 0.2)',
      iconColor: '#60a5fa',
    },
    amber: {
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%)',
      border: 'rgba(245, 158, 11, 0.25)',
      iconBg: 'rgba(245, 158, 11, 0.2)',
      iconColor: '#fbbf24',
    },
    emerald: {
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)',
      border: 'rgba(16, 185, 129, 0.25)',
      iconBg: 'rgba(16, 185, 129, 0.2)',
      iconColor: '#34d399',
    },
    rose: {
      gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.05) 100%)',
      border: 'rgba(239, 68, 68, 0.25)',
      iconBg: 'rgba(239, 68, 68, 0.2)',
      iconColor: '#f87171',
    },
    purple: {
      gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.05) 100%)',
      border: 'rgba(139, 92, 246, 0.25)',
      iconBg: 'rgba(139, 92, 246, 0.2)',
      iconColor: '#a78bfa',
    },
    slate: {
      gradient: 'linear-gradient(135deg, rgba(148, 163, 184, 0.1) 0%, rgba(100, 116, 139, 0.03) 100%)',
      border: 'rgba(148, 163, 184, 0.2)',
      iconBg: 'rgba(148, 163, 184, 0.15)',
      iconColor: '#cbd5e1',
    },
  };

  const scheme = schemes[colorScheme] || schemes.blue;

  return (
    <div
      onClick={onClick}
      style={{
        background: scheme.gradient,
        border: `1px solid ${scheme.border}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.transform = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: scheme.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: scheme.iconColor,
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div>
        <div
          style={{
            fontSize: '1.875rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {value}
        </div>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
