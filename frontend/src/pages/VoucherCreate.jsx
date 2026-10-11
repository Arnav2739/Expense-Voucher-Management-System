import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SignaturePadModal } from '../components/SignaturePadModal';
import {
  Save,
  Send,
  ArrowLeft,
  AlertCircle,
  FileCheck,
  Building,
  Calendar,
  DollarSign,
  Tag,
  PenTool,
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

export const VoucherCreate = ({ onBack, onCreated }) => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    voucher_date: today,
    expense_date: today,
    department_name: user?.department || 'Engineering',
    expense_title: '',
    expense_category: 'Software / Cloud Services',
    expense_description: '',
    amount: '',
  });

  const [signatureUrl, setSignatureUrl] = useState(user?.signature_url || null);
  const [signatureData, setSignatureData] = useState(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isSubmittingDirectly, setIsSubmittingDirectly] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.department_name.trim()) errs.department_name = 'Department is mandatory.';
    if (!formData.expense_title.trim()) errs.expense_title = 'Expense Title is mandatory.';
    if (!formData.expense_date) errs.expense_date = 'Expense Date is mandatory.';
    const num = parseFloat(formData.amount);
    if (!formData.amount || isNaN(num) || num <= 0) {
      errs.amount = 'Amount is mandatory and must be greater than zero.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // 1. Save as Draft
  const handleSaveDraft = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.createVoucher({
        ...formData,
        employee_signature_url: signatureUrl,
      });
      if (res.success) {
        onCreated(res.voucher.id);
      }
    } catch (err) {
      setErrors({ form: err.message || 'Failed to save voucher draft.' });
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit for Approval
  const handleSubmitFlow = async () => {
    if (!validate()) return;

    // Check signature requirement (Rule 12 & Section 9: Signature mandatory before submission)
    if (!signatureUrl && !signatureData) {
      setIsSubmittingDirectly(true);
      setIsSignatureModalOpen(true);
      return;
    }

    await performCreationAndSubmission(signatureUrl, signatureData);
  };

  const performCreationAndSubmission = async (sigUrl, sigData) => {
    setLoading(true);
    try {
      // Create draft first (Rule 3: Every new voucher initially saved as draft)
      const createRes = await api.createVoucher({
        ...formData,
        employee_signature_url: sigUrl,
      });

      if (!createRes.success) {
        throw new Error(createRes.message || 'Creation failed');
      }

      const voucherId = createRes.voucher.id;

      // Submit immediately
      const submitRes = await api.submitVoucher(voucherId, {
        signature_url: sigUrl,
        signatureData: sigData,
      });

      if (submitRes.success) {
        onCreated(voucherId);
      }
    } catch (err) {
      setErrors({ form: err.message || 'Failed to submit voucher.' });
    } finally {
      setLoading(false);
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
        alert('Failed to upload signature image: ' + err.message);
        return;
      }
    } else if (sigResult.type === 'url') {
      finalUrl = sigResult.url;
      setSignatureUrl(finalUrl);
    }

    if (isSubmittingDirectly) {
      setIsSubmittingDirectly(false);
      await performCreationAndSubmission(finalUrl, finalData);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="btn btn-secondary"
        style={{ marginBottom: '1.25rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {/* Title */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
            New Expense Reimbursement Voucher
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Voucher number will be automatically generated upon creation.
          </p>
        </div>

        {/* Global error */}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section: Employee Information (Pre-filled) */}
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Claimant Name</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {user?.name}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Employee ID</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {user?.employee_id_code || 'EMP-STANDARD'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Initial Status</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '2px' }}>
                Draft (Default)
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Department (Mandatory) */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Department *
              </label>
              <select
                name="department_name"
                value={formData.department_name}
                onChange={handleChange}
                style={{ borderColor: errors.department_name ? '#ef4444' : undefined }}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department_name && (
                <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px', display: 'block' }}>
                  {errors.department_name}
                </span>
              )}
            </div>

            {/* Expense Category (Mandatory) */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Expense Category *
              </label>
              <select
                name="expense_category"
                value={formData.expense_category}
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

          {/* Expense Title (Mandatory) */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Expense Title *
            </label>
            <input
              type="text"
              name="expense_title"
              value={formData.expense_title}
              onChange={handleChange}
              placeholder="e.g. AWS Cloud Hosting Services or Client Lunch"
              style={{ borderColor: errors.expense_title ? '#ef4444' : undefined }}
            />
            {errors.expense_title && (
              <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px', display: 'block' }}>
                {errors.expense_title}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Expense Date (Mandatory) */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Expense Date *
              </label>
              <input
                type="date"
                name="expense_date"
                value={formData.expense_date}
                onChange={handleChange}
                style={{ borderColor: errors.expense_date ? '#ef4444' : undefined }}
              />
              {errors.expense_date && (
                <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px', display: 'block' }}>
                  {errors.expense_date}
                </span>
              )}
            </div>

            {/* Amount (Mandatory, > 0) */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Claim Amount ($) *
              </label>
              <input
                type="number"
                name="amount"
                min="0.01"
                step="any"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                style={{ borderColor: errors.amount ? '#ef4444' : undefined }}
              />
              {errors.amount && (
                <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px', display: 'block' }}>
                  {errors.amount}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Expense Description & Business Justification
            </label>
            <textarea
              name="expense_description"
              rows={3}
              value={formData.expense_description}
              onChange={handleChange}
              placeholder="Provide context, purpose, or details regarding this expense..."
            />
          </div>

          {/* Signature Preview & Selection */}
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
                  Mandatory before submitting for approval. (Optional when saving as draft)
                </p>
              </div>

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
                No signature attached yet. You can attach now or when submitting for approval.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1.25rem',
              marginTop: '0.5rem',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSaveDraft}
              disabled={loading}
              style={{ padding: '0.75rem 1.4rem' }}
            >
              <Save size={16} />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmitFlow}
              disabled={loading}
              style={{ padding: '0.75rem 1.4rem' }}
            >
              <Send size={16} />
              <span>Submit for Approval</span>
            </button>
          </div>
        </div>
      </div>

      {/* Signature Pad Modal */}
      <SignaturePadModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onConfirmSignature={handleSignatureConfirmed}
        title="Employee Signature Authorization"
        description="Please provide your signature before submitting this voucher for Director approval."
        defaultSignatureUrl={user?.signature_url}
      />
    </div>
  );
};
