-- ================================================================
-- Expense Voucher Management System
-- Database Schema (PostgreSQL)
-- ================================================================

-- Create role enum or check constraint
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('employee', 'director', 'accounts')),
    department VARCHAR(255) NOT NULL,
    employee_id_code VARCHAR(100),
    signature_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers (
    id SERIAL PRIMARY KEY,
    voucher_number VARCHAR(100) UNIQUE NOT NULL,
    voucher_date DATE NOT NULL,
    expense_date DATE NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    expense_title VARCHAR(255) NOT NULL,
    expense_category VARCHAR(100) NOT NULL,
    expense_description TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    user_id INTEGER NOT NULL REFERENCES users(id),
    employee_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(100),
    employee_signature_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Rejected')),
    director_id INTEGER REFERENCES users(id),
    director_name VARCHAR(255),
    director_signature_url TEXT,
    approval_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voucher_audit_logs (
    id SERIAL PRIMARY KEY,
    voucher_id INTEGER NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    performed_by_id INTEGER REFERENCES users(id),
    performed_by_name VARCHAR(255),
    performed_by_role VARCHAR(50),
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal querying, sorting, and reporting
CREATE INDEX IF NOT EXISTS idx_vouchers_user_id ON vouchers(user_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_voucher_number ON vouchers(voucher_number);
CREATE INDEX IF NOT EXISTS idx_vouchers_dates ON vouchers(expense_date, voucher_date);
CREATE INDEX IF NOT EXISTS idx_vouchers_category ON vouchers(expense_category);
CREATE INDEX IF NOT EXISTS idx_vouchers_department ON vouchers(department_name);
