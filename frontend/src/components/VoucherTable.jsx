import React from 'react';
import { Eye, Edit3, Trash2, CheckCircle, XCircle, Printer } from 'lucide-react';
import { VoucherStatusBadge } from './VoucherStatusBadge';

export const VoucherTable = ({
  vouchers = [],
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  showEmployeeCol = true,
  currentRole = 'employee',
}) => {
  if (!vouchers || vouchers.length === 0) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
          }}
        >
          📂
        </div>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No expense vouchers found</p>
        <p style={{ fontSize: '0.85rem', maxWidth: '360px' }}>
          No records match your selected criteria or search filters.
        </p>
      </div>
    );
  }

  return (
    <div
      className="glass-panel"
      style={{
        overflowX: 'auto',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px' }}>
        <thead>
          <tr
            style={{
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Voucher No.
            </th>
            <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Expense
            </th>
            {showEmployeeCol && (
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Employee / Dept
              </th>
            )}
            <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Expense Date
            </th>
            <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Amount
            </th>
            <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Status
            </th>
            <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((v) => {
            const isDraft = v.status === 'Draft';
            const isSubmitted = v.status === 'Submitted';

            return (
              <tr
                key={v.id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Voucher Number */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <button
                    onClick={() => onView(v.id)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: 'var(--accent-primary)',
                      fontSize: '0.875rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {v.voucher_number}
                  </button>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Created: {v.voucher_date}
                  </div>
                </td>

                {/* Expense details */}
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    {v.expense_title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {v.expense_category}
                  </div>
                </td>

                {/* Employee / Dept */}
                {showEmployeeCol && (
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {v.employee_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {v.department_name} {v.employee_id ? `(${v.employee_id})` : ''}
                    </div>
                  </td>
                )}

                {/* Date */}
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {v.expense_date}
                </td>

                {/* Amount */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: '#ffffff',
                    }}
                  >
                    ${Number(v.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </td>

                {/* Status */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <VoucherStatusBadge status={v.status} size="sm" />
                </td>

                {/* Actions */}
                <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                    {/* View Details */}
                    <button
                      onClick={() => onView(v.id)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                      title="View Details"
                    >
                      <Eye size={14} />
                      <span>Details</span>
                    </button>

                    {/* Employee Draft Actions */}
                    {currentRole === 'employee' && isDraft && (
                      <>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(v.id)}
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            title="Edit Draft"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(v.id, v.voucher_number)}
                            className="btn btn-danger"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            title="Delete Draft"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </>
                    )}

                    {/* Director Quick Actions for Pending */}
                    {currentRole === 'director' && isSubmitted && (
                      <>
                        {onApprove && (
                          <button
                            onClick={() => onApprove(v)}
                            className="btn btn-success"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            title="Approve Voucher"
                          >
                            <CheckCircle size={14} />
                            <span>Approve</span>
                          </button>
                        )}
                        {onReject && (
                          <button
                            onClick={() => onReject(v)}
                            className="btn btn-danger"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            title="Reject Voucher"
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* Accounts Team Quick Print */}
                    {currentRole === 'accounts' && (
                      <button
                        onClick={() => onView(v.id)}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                        title="View / Print Voucher"
                      >
                        <Printer size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
