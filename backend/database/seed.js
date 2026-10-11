const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { db, initDb, run, query, exec } = require('../src/config/db');

// Sample base64 transparent PNG signature dummy or SVG
const createDummySignatureFile = (filename, nameText) => {
  const uploadDir = path.resolve(__dirname, '../uploads/signatures');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filePath = path.join(uploadDir, filename);
  
  // Create an aesthetic SVG signature
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100">
  <rect width="100%" height="100%" fill="none"/>
  <path d="M 20 60 Q 50 15, 80 50 T 140 45 Q 170 10, 200 65 T 260 55" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>
  <path d="M 30 75 Q 120 70, 270 72" fill="none" stroke="#1d4ed8" stroke-width="2" stroke-linecap="round"/>
  <text x="35" y="88" font-family="cursive, 'Brush Script MT', sans-serif" font-size="16" fill="#1e293b">${nameText}</text>
</svg>`;

  fs.writeFileSync(filePath, svgContent, 'utf8');
  return `/uploads/signatures/${filename}`;
};

const seed = async () => {
  try {
    console.log('--- Initializing database for seeding ---');
    await initDb();

    // Check if users already seeded
    const existingUsers = await query('SELECT count(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      console.log('Database already contains users. Resetting tables for clean seed...');
      await exec('DELETE FROM voucher_audit_logs');
      await exec('DELETE FROM vouchers');
      await exec('DELETE FROM users');
    }

    const passwordHash = await bcrypt.hash('password123', 10);

    const empSig1 = createDummySignatureFile('sig_emp_sarah.svg', 'Sarah Connor');
    const empSig2 = createDummySignatureFile('sig_emp_alex.svg', 'Alex Morgan');
    const dirSig = createDummySignatureFile('sig_dir_david.svg', 'David Vance (Director)');

    // 1. Insert Users
    console.log('Seeding demo users...');
    const sarahRes = await run(
      `INSERT INTO users (name, email, password_hash, role, department, employee_id_code, signature_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Sarah Connor', 'employee@abccompany.com', passwordHash, 'employee', 'Engineering', 'EMP-1001', empSig1]
    );

    const alexRes = await run(
      `INSERT INTO users (name, email, password_hash, role, department, employee_id_code, signature_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Alex Morgan', 'alex@abccompany.com', passwordHash, 'employee', 'Marketing', 'EMP-1002', empSig2]
    );

    const directorRes = await run(
      `INSERT INTO users (name, email, password_hash, role, department, employee_id_code, signature_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['David Vance', 'director@abccompany.com', passwordHash, 'director', 'Executive', 'DIR-0001', dirSig]
    );

    const accountsRes = await run(
      `INSERT INTO users (name, email, password_hash, role, department, employee_id_code, signature_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Rachel Green', 'accounts@abccompany.com', passwordHash, 'accounts', 'Finance & Accounts', 'ACC-5001', null]
    );

    const sarahId = sarahRes.lastID;
    const alexId = alexRes.lastID;
    const directorId = directorRes.lastID;

    console.log('Seeding sample vouchers...');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    // Voucher 1: Draft (Sarah Connor)
    const v1 = await run(
      `INSERT INTO vouchers (
        voucher_number, voucher_date, expense_date, department_name,
        expense_title, expense_category, expense_description, amount,
        user_id, employee_name, employee_id, employee_signature_url,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'EV-2026-0001',
        today,
        yesterday,
        'Engineering',
        'Cloud Server Infrastructure Testing',
        'Software / Cloud Services',
        'AWS EC2 and Cloudflare cache testing for staging benchmark tests.',
        420.50,
        sarahId,
        'Sarah Connor',
        'EMP-1001',
        null,
        'Draft'
      ]
    );

    await run(
      `INSERT INTO voucher_audit_logs (voucher_id, action, performed_by_id, performed_by_name, performed_by_role, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [v1.lastID, 'CREATED', sarahId, 'Sarah Connor', 'employee', 'Saved voucher as Draft']
    );

    // Voucher 2: Submitted / Pending Approval (Sarah Connor)
    const v2 = await run(
      `INSERT INTO vouchers (
        voucher_number, voucher_date, expense_date, department_name,
        expense_title, expense_category, expense_description, amount,
        user_id, employee_name, employee_id, employee_signature_url,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'EV-2026-0002',
        yesterday,
        threeDaysAgo,
        'Engineering',
        'Conference Tickets & Workshop Registration',
        'Training & Seminars',
        'Registration pass for the annual Full Stack Systems Architecture Summit 2026.',
        1250.00,
        sarahId,
        'Sarah Connor',
        'EMP-1001',
        empSig1,
        'Submitted'
      ]
    );

    await run(
      `INSERT INTO voucher_audit_logs (voucher_id, action, performed_by_id, performed_by_name, performed_by_role, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [v2.lastID, 'CREATED', sarahId, 'Sarah Connor', 'employee', 'Initial draft created']
    );
    await run(
      `INSERT INTO voucher_audit_logs (voucher_id, action, performed_by_id, performed_by_name, performed_by_role, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [v2.lastID, 'SUBMITTED', sarahId, 'Sarah Connor', 'employee', 'Submitted for Director approval with employee signature']
    );

    // Voucher 3: Submitted / Pending Approval (Alex Morgan)
    const v3 = await run(
      `INSERT INTO vouchers (
        voucher_number, voucher_date, expense_date, department_name,
        expense_title, expense_category, expense_description, amount,
        user_id, employee_name, employee_id, employee_signature_url,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'EV-2026-0003',
        today,
        yesterday,
        'Marketing',
        'Product Launch Promotional Banners',
        'Advertising & Marketing',
        'Printing materials and roll-up banners for Q4 product announcement.',
        890.00,
        alexId,
        'Alex Morgan',
        'EMP-1002',
        empSig2,
        'Submitted'
      ]
    );

    await run(
      `INSERT INTO voucher_audit_logs (voucher_id, action, performed_by_id, performed_by_name, performed_by_role, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [v3.lastID, 'SUBMITTED', alexId, 'Alex Morgan', 'employee', 'Voucher submitted for approval']
    );

    // Voucher 4: Approved (Sarah Connor -> Approved by Director)
    const v4 = await run(
      `INSERT INTO vouchers (
        voucher_number, voucher_date, expense_date, department_name,
        expense_title, expense_category, expense_description, amount,
        user_id, employee_name, employee_id, employee_signature_url,
        status, director_id, director_name, director_signature_url, approval_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'EV-2026-0004',
        lastWeek,
        lastWeek,
        'Engineering',
        'Ergonomic Monitor & Developer Equipment',
        'Hardware & Office Equipment',
        'Dual monitor arm and mechanical keyboard for workstation upgrade.',
        645.75,
        sarahId,
        'Sarah Connor',
        'EMP-1001',
        empSig1,
        'Approved',
        directorId,
        'David Vance',
        dirSig,
        new Date().toISOString()
      ]
    );

    await run(
      `INSERT INTO voucher_audit_logs (voucher_id, action, performed_by_id, performed_by_name, performed_by_role, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [v4.lastID, 'APPROVED', directorId, 'David Vance', 'director', 'Voucher approved and forwarded to Accounts Team']
    );

    // Voucher 5: Rejected (Alex Morgan -> Rejected by Director)
    const v5 = await run(
      `INSERT INTO vouchers (
        voucher_number, voucher_date, expense_date, department_name,
        expense_title, expense_category, expense_description, amount,
        user_id, employee_name, employee_id, employee_signature_url,
        status, director_id, director_name, rejection_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'EV-2026-0005',
        lastWeek,
        lastWeek,
        'Marketing',
        'Client Dinner at The Grand Bistro',
        'Meals & Entertainment',
        'Dinner with prospective client representatives during contract renewal negotiation.',
        340.00,
        alexId,
        'Alex Morgan',
        'EMP-1002',
        empSig2,
        'Rejected',
        directorId,
        'David Vance',
        'Missing itemized tax invoice and attendee list. Please resubmit with official itemized billing.'
      ]
    );

    await run(
      `INSERT INTO voucher_audit_logs (voucher_id, action, performed_by_id, performed_by_name, performed_by_role, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [v5.lastID, 'REJECTED', directorId, 'David Vance', 'director', 'Rejected: Missing itemized tax invoice and attendee list']
    );

    console.log('✅ Seeding completed successfully!');
    console.log('Sample Accounts:');
    console.log('1. Employee: employee@abccompany.com | password123');
    console.log('2. Employee: alex@abccompany.com     | password123');
    console.log('3. Director: director@abccompany.com | password123');
    console.log('4. Accounts: accounts@abccompany.com | password123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
