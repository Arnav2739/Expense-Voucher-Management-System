import React from 'react';
import { Printer, CheckCircle, Clock, XCircle } from 'lucide-react';
import { VoucherStatusBadge } from './VoucherStatusBadge';

export const PrintableVoucher = ({ voucher }) => {
  if (!voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="printable-voucher-container">
      {/* Print Trigger Button (Hidden when printing) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '1rem',
          gap: '0.5rem',
        }}
      >
        <button
          onClick={handlePrint}
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      {/* The Printable Voucher Paper */}
      <div
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          padding: '2.5rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid #e2e8f0',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #0f172a',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              ABC COMPANY
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
              EXPENSE REIMBURSEMENT VOUCHER
            </p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Corporate Finance & Reimbursements Division
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                color: '#2563eb',
              }}
            >
              {voucher.voucher_number}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Date: {voucher.voucher_date}
            </div>
            <div style={{ marginTop: '6px' }}>
              <VoucherStatusBadge status={voucher.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.25rem',
            backgroundColor: '#f8fafc',
            padding: '1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #e2e8f0',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Employee Details
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {voucher.employee_name}
            </div>
            <div style={{ fontSize: '0.825rem', color: '#475569' }}>
              ID: {voucher.employee_id || 'N/A'}
            </div>
            <div style={{ fontSize: '0.825rem', color: '#475569' }}>
              Dept: {voucher.department_name}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Expense Details
            </div>
            <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '2px' }}>
              <strong>Expense Date:</strong> {voucher.expense_date}
            </div>
            <div style={{ fontSize: '0.825rem', color: '#475569' }}>
              <strong>Category:</strong> {voucher.expense_category}
            </div>
            <div style={{ fontSize: '0.825rem', color: '#475569' }}>
              <strong>Payment Route:</strong> Accounts Reimbursement
            </div>
          </div>
        </div>

        {/* Expense Items Breakdown */}
        <div style={{ marginBottom: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1', backgroundColor: '#f1f5f9' }}>
                <th style={{ padding: '0.75rem', fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                  Item / Description
                </th>
                <th style={{ padding: '0.75rem', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textAlign: 'right' }}>
                  Amount ($)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                    {voucher.expense_title}
                  </div>
                  {voucher.expense_description && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                      {voucher.expense_description}
                    </div>
                  )}
                </td>
                <td style={{ padding: '0.85rem', textAlign: 'right', fontWeight: 700, fontSize: '1rem', fontFamily: 'monospace' }}>
                  ${Number(voucher.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              {/* Total Row */}
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <td style={{ padding: '0.85rem', fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>
                  Total Claimed Amount:
                </td>
                <td
                  style={{
                    padding: '0.85rem',
                    textAlign: 'right',
                    fontWeight: 800,
                    fontSize: '1.15rem',
                    color: '#2563eb',
                    fontFamily: 'monospace',
                  }}
                >
                  ${Number(voucher.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Rejection Remark notice if rejected */}
        {voucher.status === 'Rejected' && voucher.rejection_reason && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              color: '#991b1b',
              fontSize: '0.85rem',
            }}
          >
            <strong>Rejection Reason: </strong> {voucher.rejection_reason}
          </div>
        )}

        {/* Dual Signatures Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px dashed #cbd5e1',
          }}
        >
          {/* Employee Signature Box */}
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
              backgroundColor: '#fafafa',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              Employee Signature
            </div>
            <div
              style={{
                height: '75px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                padding: '4px',
              }}
            >
              {voucher.employee_signature_url ? (
                <img
                  src={voucher.employee_signature_url}
                  alt="Employee Signature"
                  style={{ maxHeight: '65px', maxWidth: '100%', objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  No signature on file
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginTop: '6px' }}>
              {voucher.employee_name}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Submitted on: {voucher.voucher_date}
            </div>
          </div>

          {/* Director Approval Signature Box */}
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
              backgroundColor: '#fafafa',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              Director Authorization
            </div>
            <div
              style={{
                height: '75px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                padding: '4px',
              }}
            >
              {voucher.director_signature_url ? (
                <img
                  src={voucher.director_signature_url}
                  alt="Director Signature"
                  style={{ maxHeight: '65px', maxWidth: '100%', objectFit: 'contain' }}
                />
              ) : voucher.status === 'Rejected' ? (
                <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>
                  DECLINED BY DIRECTOR
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  Pending Director Review
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginTop: '6px' }}>
              {voucher.director_name || 'Authorized Director'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {voucher.approval_date
                ? `Approved: ${voucher.approval_date.split('T')[0]}`
                : voucher.status === 'Approved'
                ? 'Approved'
                : 'Status: ' + voucher.status}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: '0.7rem',
            color: '#94a3b8',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '0.75rem',
          }}
        >
          This is an official expense voucher record generated by ABC Company Expense Voucher Management System.
        </div>
      </div>
    </div>
  );
};
