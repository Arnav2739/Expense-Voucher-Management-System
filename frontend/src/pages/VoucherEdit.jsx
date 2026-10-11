import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SignaturePadModal } from '../components/SignaturePadModal';
import {
  Save,
  Send,
  ArrowLeft,
  AlertCircle,
  PenTool,
  Trash2,
} from 'lucide-react';

const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Human Resources',
  'Operations',
  'Finance & Accounts',
  'Product Design',
  'Executive',
  'Legal & Compliance',
];

const CATEGORIES = [
  'Software / Cloud Services',
  'Hardware & Office Equipment',
  'Travel & Lodging',
  'Meals & Entertainment',
  'Training & Seminars',
  'Office Supplies',
  'Advertising & Marketing',
  'Client Entertainment',
  'Utilities & Bills',
  'Other',
];

export const VoucherEdit = ({ voucherId, onBack, onSaved, onDeleted }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(null);
  const [initialVoucher, setInitialVoucher] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [signatureData, setSignatureData] = useState(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isSubmittingDirectly, setIsSubmittingDirectly] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        setLoading(true);
        const res = await api.getVoucher(voucherId);
        if (res.success && res.voucher) {
          const v = res.voucher;
          if (v.status !== 'Draft') {
            setErrors({
              form: `This voucher is in '${v.status}' status and is read-only. Only Draft vouchers can be edited.`,
            });
          }
          setInitialVoucher(v);
          setFormData({
            voucher_date: v.voucher_date,
            expense_date: v.expense_date,
            department_name: v.department_name,
            expense_title: v.expense_title,
            expense_category: v.expense_category,
            expense_description: v.expense_description || '',
            amount: v.amount,
          });
          setSignatureUrl(v.employee_signature_url || user?.signature_url || null);
        }
      } catch (err) {
        setErrors({ form: err.message || 'Failed to load voucher for editing' });
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [voucherId, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.department_name?.trim()) errs.department_name = 'Department is mandatory.';
    if (!formData.expense_title?.trim()) errs.expense_title = 'Expense Title is mandatory.';
    if (!formData.expense_date) errs.expense_date = 'Expense Date is mandatory.';
    const num = parseFloat(formData.amount);
    if (!formData.amount || isNaN(num) || num <= 0) {
      errs.amount = 'Amount is mandatory and must be greater than zero.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdateDraft = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await api.updateVoucher(voucherId, {
        ...formData,
        employee_signature_url: signatureUrl,
      });
      if (res.success) {
        onSaved(voucherId);
      }
    } catch (err) {
      setErrors({ form: err.message || 'Failed to update draft.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitFlow = async () => {
    if (!validate()) return;

    if (!signatureUrl && !signatureData) {
      setIsSubmittingDirectly(true);
      setIsSignatureModalOpen(true);
      return;
    }

    await performSubmit(signatureUrl, signatureData);
  };

  const performSubmit = async (sigUrl, sigData) => {
    setSaving(true);
    try {
      // Update fields first
      await api.updateVoucher(voucherId, {
        ...formData,
        employee_signature_url: sigUrl,
      });

      // Submit
      const res = await api.submitVoucher(voucherId, {
        signature_url: sigUrl,
        signatureData: sigData,
      });

      if (res.success) {
        onSaved(voucherId);
      }
    } catch (err) {
      setErrors({ form: err.message || 'Submission failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete draft voucher ${initialVoucher?.voucher_number}?`)) {
      return;
    }
    setSaving(true);
    try {
      const res = await api.deleteVoucher(voucherId);
      if (res.success) {
        onDeleted();
      }
    } catch (err) {
      setErrors({ form: err.message || 'Failed to delete draft.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSignatureConfirmed = async (sigResult) => {
    let finalUrl = null;
    let finalData = null;

    if (sigResult.type === 'base64') {
      finalData = sigResult.data;
      setSignatureData(finalData);
      setSignatureUrl(finalData);
    } else if (sigResult.type === 'file') {
      try {
        const uploadRes = await api.uploadSignature(sigResult.file);
        if (uploadRes.success) {
          finalUrl = uploadRes.signatureUrl;
          setSignatureUrl(finalUrl);
        }
      } catch (err) {
        alert('Failed to upload signature: ' + err.message);
        return;
      }
    } else if (sigResult.type === 'url') {
      finalUrl = sigResult.url;
      setSignatureUrl(finalUrl);
    }

    if (isSubmittingDirectly) {
      setIsSubmittingDirectly(false);
      await performSubmit(finalUrl, finalData);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading draft details...</div>;
  }

  const isReadOnly = initialVoucher?.status !== 'Draft';

  return (
    <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <button
        onClick={onBack}
        className="btn btn-secondary"
        style={{ marginBottom: '1.25rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Voucher</span>
      </button>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
              Edit Draft Voucher
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Editing <span style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{initialVoucher?.voucher_number}</span> (Status: {initialVoucher?.status})
            </p>
          </div>

          {!isReadOnly && (
            <button
              onClick={handleDelete}
              className="btn btn-danger"
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}
            >
              <Trash2 size={15} />
              <span>Delete Draft</span>
            </button>
          )}
        </div>

        {errors.form && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errors.form}</span>
          </div>
        )}

        <fieldset disabled={isReadOnly || saving} style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Form Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Department *
              </label>
              <select
                name="department_name"
                value={formData?.department_name || ''}
                onChange={handleChange}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Expense Category *
              </label>
              <select
                name="expense_category"
                value={formData?.expense_category || ''}
                onChange={handleChange}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Expense Title *
            </label>
            <input
              type="text"
              name="expense_title"
              value={formData?.expense_title || ''}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Expense Date *
              </label>
              <input
                type="date"
                name="expense_date"
                value={formData?.expense_date || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Claim Amount ($) *
              </label>
              <input
                type="number"
                name="amount"
                min="0.01"
                step="any"
                value={formData?.amount || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Expense Description
            </label>
            <textarea
              name="expense_description"
              rows={3}
              value={formData?.expense_description || ''}
              onChange={handleChange}
            />
          </div>

          {/* Signature */}
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Employee Signature
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Required for final submission for approval
                </p>
              </div>

              {!isReadOnly && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsSubmittingDirectly(false);
                    setIsSignatureModalOpen(true);
                  }}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                >
                  <PenTool size={14} />
                  <span>{signatureUrl ? 'Change Signature' : 'Attach Signature'}</span>
                </button>
              )}
            </div>

            {signatureUrl ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  maxHeight: '100px',
                  width: 'fit-content',
                  minWidth: '220px',
                }}
              >
                <img
                  src={signatureUrl}
                  alt="Employee signature"
                  style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No signature attached.
              </div>
            )}
          </div>

          {!isReadOnly && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1.25rem',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleUpdateDraft}
                disabled={saving}
                style={{ padding: '0.75rem 1.4rem' }}
              >
                <Save size={16} />
                <span>Save Draft Changes</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmitFlow}
                disabled={saving}
                style={{ padding: '0.75rem 1.4rem' }}
              >
                <Send size={16} />
                <span>Submit for Approval</span>
              </button>
            </div>
          )}
        </fieldset>
      </div>

      <SignaturePadModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onConfirmSignature={handleSignatureConfirmed}
        title="Employee Signature Authorization"
        description="Attach signature before submitting this voucher for Director review."
        defaultSignatureUrl={user?.signature_url}
      />
    </div>
  );
};
