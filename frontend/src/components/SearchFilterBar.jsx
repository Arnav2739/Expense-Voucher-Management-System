import React, { useState } from 'react';
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

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

export const SearchFilterBar = ({
  filters,
  onFilterChange,
  onReset,
  showEmployeeFilter = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Top Search & Quick Filters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        {/* Keyword Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleChange}
            placeholder="Search title, voucher #, employee..."
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Status Filter */}
        <select name="status" value={filters.status || ''} onChange={handleChange}>
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Submitted">Pending Approval (Submitted)</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        {/* Category Filter */}
        <select name="expense_category" value={filters.expense_category || ''} onChange={handleChange}>
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Department Filter */}
        <select name="department" value={filters.department || ''} onChange={handleChange}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        {/* Toggle Advanced Filters Button */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ flex: 1, padding: '0.65rem 0.8rem', fontSize: '0.8rem' }}
          >
            <Filter size={15} />
            <span>More Filters</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={onReset}
            title="Reset All Filters"
            style={{ padding: '0.65rem 0.8rem' }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Advanced Expandable Panel */}
      {isExpanded && (
        <div
          className="animate-fade-in"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Voucher Number specific filter */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Voucher Number
            </label>
            <input
              type="text"
              name="voucher_number"
              value={filters.voucher_number || ''}
              onChange={handleChange}
              placeholder="e.g. EV-202610-0001"
            />
          </div>

          {/* Employee Name filter (if allowed) */}
          {showEmployeeFilter && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Employee Name
              </label>
              <input
                type="text"
                name="employee_name"
                value={filters.employee_name || ''}
                onChange={handleChange}
                placeholder="Filter by employee"
              />
            </div>
          )}

          {/* Date Range: From */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Expense Date From
            </label>
            <input
              type="date"
              name="date_from"
              value={filters.date_from || ''}
              onChange={handleChange}
            />
          </div>

          {/* Date Range: To */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Expense Date To
            </label>
            <input
              type="date"
              name="date_to"
              value={filters.date_to || ''}
              onChange={handleChange}
            />
          </div>

          {/* Min Amount */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Min Amount ($)
            </label>
            <input
              type="number"
              name="min_amount"
              min="0"
              step="any"
              value={filters.min_amount || ''}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          {/* Max Amount */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Max Amount ($)
            </label>
            <input
              type="number"
              name="max_amount"
              min="0"
              step="any"
              value={filters.max_amount || ''}
              onChange={handleChange}
              placeholder="5000.00"
            />
          </div>

          {/* Sorting */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Sort By
            </label>
            <select
              name="sortBy"
              value={filters.sortBy || 'id'}
              onChange={handleChange}
            >
              <option value="id">Latest Added</option>
              <option value="expense_date">Expense Date</option>
              <option value="amount">Amount ($)</option>
              <option value="voucher_number">Voucher #</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Order
            </label>
            <select
              name="order"
              value={filters.order || 'DESC'}
              onChange={handleChange}
            >
              <option value="DESC">Descending</option>
              <option value="ASC">Ascending</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
