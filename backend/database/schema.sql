-- ================================================================
-- Expense Voucher Management System
-- Database Schema (SQLite)
-- ================================================================

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('employee', 'director', 'accounts')),
    department TEXT NOT NULL,
    employee_id_code TEXT,
    signature_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_number TEXT UNIQUE NOT NULL,
    voucher_date TEXT NOT NULL,
    expense_date TEXT NOT NULL,
    department_name TEXT NOT NULL,
    expense_title TEXT NOT NULL,
    expense_category TEXT NOT NULL,
    expense_description TEXT,
    amount REAL NOT NULL CHECK(amount > 0),
    user_id INTEGER NOT NULL REFERENCES users(id),
    employee_name TEXT NOT NULL,
    employee_id TEXT,
    employee_signature_url TEXT,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft', 'Submitted', 'Approved', 'Rejected')),
    director_id INTEGER REFERENCES users(id),
    director_name TEXT,
    director_signature_url TEXT,
    approval_date TEXT,
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voucher_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_id INTEGER NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    performed_by_id INTEGER REFERENCES users(id),
    performed_by_name TEXT,
    performed_by_role TEXT,
    notes TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance and quick searching/filtering
CREATE INDEX IF NOT EXISTS idx_vouchers_user_id ON vouchers(user_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_voucher_number ON vouchers(voucher_number);
CREATE INDEX IF NOT EXISTS idx_vouchers_dates ON vouchers(expense_date, voucher_date);
CREATE INDEX IF NOT EXISTS idx_vouchers_category ON vouchers(expense_category);
CREATE INDEX IF NOT EXISTS idx_vouchers_department ON vouchers(department_name);
