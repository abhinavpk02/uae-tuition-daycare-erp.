-- Turso (libSQL) / Drizzle Studio SQL Seed Script
-- Execute these standard SQL queries directly inside Drizzle Studio query window or Turso CLI

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    hash TEXT NOT NULL,
    role TEXT NOT NULL,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS profiles_parent (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    alt_phone TEXT
);

CREATE TABLE IF NOT EXISTS profiles_staff (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dob TEXT,
    passport_no TEXT,
    emirates_id TEXT UNIQUE NOT NULL,
    address TEXT,
    hourly_rate NUMERIC DEFAULT 0.00 NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    parent_id TEXT NOT NULL REFERENCES profiles_parent(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    dob TEXT,
    standard TEXT NOT NULL,
    program TEXT NOT NULL DEFAULT 'Tuition'
);

CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT
);

-- 2. Insert Test Data (Double-quoted or Single-quoted strings in standard SQL format)
INSERT OR IGNORE INTO users (id, email, hash, role, is_active) VALUES 
('usr-admin-001', 'admin@uaeerp.ae', '$2b$12$eImiTXuWVxfM37uY4JANjO5yYVqJ7wJ5YVqJ7wJ5YVqJ7wJ5YVqJ', 'SuperAdmin', 1),
('usr-teacher-001', 'fatima@uaeerp.ae', 'staff123', 'Teacher', 1),
('usr-parent-001', 'parent@uaeerp.ae', 'parent123', 'Parent', 1);

INSERT OR IGNORE INTO profiles_parent (id, user_id, phone, alt_phone) VALUES 
('prt-001', 'usr-parent-001', '+971 50 123 4567', '+971 4 321 0000');

INSERT OR IGNORE INTO profiles_staff (id, user_id, name, dob, passport_no, emirates_id, address, hourly_rate) VALUES 
('stf-001', 'usr-teacher-001', 'Fatima Al-Mansoori', '1992-03-20', 'N9876543', '784-1992-8821941-1', 'Al Wasl Road, Villa 42, Dubai, UAE', 120.00);

INSERT OR IGNORE INTO students (id, parent_id, name, dob, standard, program) VALUES 
('std-001', 'prt-001', 'Zayed Al-Hashimi', '2012-05-14', 'Grade 10', 'Both');

INSERT OR IGNORE INTO chart_of_accounts (id, code, name, type, description) VALUES 
('coa-1000', '1000', 'Cash & Bank Balance', 'Asset', 'Primary bank and cash account'),
('coa-1100', '1100', 'Accounts Receivable', 'Asset', 'Student fee receivables'),
('coa-1200', '1200', 'Inventory Asset', 'Asset', 'Physical inventory on hand'),
('coa-2000', '2000', 'Accounts Payable', 'Liability', 'Payables to vendors'),
('coa-3000', '3000', 'Owner Capital / Equity', 'Equity', 'Initial owner capital'),
('coa-4000', '4000', 'Tuition Fee Revenue', 'Revenue', 'Tuition revenue'),
('coa-4100', '4100', 'Daycare Service Revenue', 'Revenue', 'Daycare service billing'),
('coa-4200', '4200', 'POS Sales Revenue', 'Revenue', 'Point of sale item sales'),
('coa-5000', '5000', 'Staff Payroll Expense', 'Expense', 'Teacher and staff salaries');
