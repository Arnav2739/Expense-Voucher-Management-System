const { query, get, run } = require('../config/db');
const { generateVoucherNumber } = require('../utils/voucherNumberGenerator');
const { saveBase64Image } = require('../middleware/uploadMiddleware');

/**
 * Helper to log audit trail
 */
const logAudit = async (voucherId, action, user, notes = '') => {
  try {
    await run(
      `INSERT INTO voucher_audit_logs (voucher_id, action, performed_by_id, performed_by_name, performed_by_role, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [voucherId, action, user.id, user.name, user.role, notes]
    );
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

/**
 * 1. Create a new Voucher
 * Rule #3: Every new voucher should initially be saved as Draft
 */
const createVoucher = async (req, res, next) => {
  try {
    const {
      voucher_date,
      expense_date,
      department_name,
      expense_title,
      expense_category,
      expense_description,
      amount,
      employee_signature_url,
    } = req.body;

    // Validation rules:
    // - Department is mandatory
    if (!department_name || !department_name.trim()) {
      return res.status(400).json({ success: false, message: 'Department is mandatory.' });
    }
    // - Expense Title is mandatory
    if (!expense_title || !expense_title.trim()) {
      return res.status(400).json({ success: false, message: 'Expense Title is mandatory.' });
    }
    // - Expense Date is mandatory
    if (!expense_date) {
      return res.status(400).json({ success: false, message: 'Expense Date is mandatory.' });
    }
    // - Amount is mandatory and must be greater than zero
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount is mandatory and must be greater than zero.' });
    }

    // Auto-generate unique voucher number (Rules #1, #2)
    const voucher_number = await generateVoucherNumber();
    const formattedVoucherDate = voucher_date || new Date().toISOString().split('T')[0];

    const result = await run(
      `INSERT INTO vouchers (
        voucher_number, voucher_date, expense_date, department_name,
        expense_title, expense_category, expense_description, amount,
        user_id, employee_name, employee_id, employee_signature_url,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft')`,
      [
        voucher_number,
        formattedVoucherDate,
        expense_date,
        department_name.trim(),
        expense_title.trim(),
        expense_category || 'General Expense',
        expense_description ? expense_description.trim() : '',
        parsedAmount,
        req.user.id,
        req.user.name,
        req.user.employee_id_code || null,
        employee_signature_url || null,
      ]
    );

    const newVoucher = await get(`SELECT * FROM vouchers WHERE id = ?`, [result.lastID]);
    await logAudit(newVoucher.id, 'CREATED', req.user, 'Voucher created in Draft status');

    return res.status(201).json({
      success: true,
      message: 'Voucher created successfully as Draft',
      voucher: newVoucher,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Update Draft Voucher
 * Rule #4: Employees may edit vouchers only while they are in Draft status.
 * Rule #5: Once submitted, vouchers become read-only for employees.
 * Director cannot modify details entered by employee. Accounts cannot edit.
 */
const updateVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const voucher = await get(`SELECT * FROM vouchers WHERE id = ?`, [id]);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    // Check ownership
    if (req.user.role === 'employee' && voucher.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only edit your own vouchers.' });
    }

    if (req.user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Only the employee who authored the draft voucher may edit its details.',
      });
    }

    // Check status
    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Voucher is currently in '${voucher.status}' status and is read-only. Only Draft vouchers can be edited.`,
      });
    }

    const {
      voucher_date,
      expense_date,
      department_name,
      expense_title,
      expense_category,
      expense_description,
      amount,
      employee_signature_url,
    } = req.body;

    if (!department_name || !department_name.trim()) {
      return res.status(400).json({ success: false, message: 'Department is mandatory.' });
    }
    if (!expense_title || !expense_title.trim()) {
      return res.status(400).json({ success: false, message: 'Expense Title is mandatory.' });
    }
    if (!expense_date) {
      return res.status(400).json({ success: false, message: 'Expense Date is mandatory.' });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount is mandatory and must be greater than zero.' });
    }

    await run(
      `UPDATE vouchers SET
        voucher_date = ?,
        expense_date = ?,
        department_name = ?,
        expense_title = ?,
        expense_category = ?,
        expense_description = ?,
        amount = ?,
        employee_signature_url = COALESCE(?, employee_signature_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        voucher_date || voucher.voucher_date,
        expense_date,
        department_name.trim(),
        expense_title.trim(),
        expense_category || voucher.expense_category,
        expense_description ? expense_description.trim() : '',
        parsedAmount,
        employee_signature_url || null,
        id,
      ]
    );

    const updated = await get(`SELECT * FROM vouchers WHERE id = ?`, [id]);
    await logAudit(id, 'UPDATED', req.user, 'Draft voucher details updated');

    return res.status(200).json({
      success: true,
      message: 'Voucher updated successfully',
      voucher: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Delete Draft Voucher
 * Rule #4: Employees may delete vouchers only while they are in Draft status.
 */
const deleteVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const voucher = await get(`SELECT * FROM vouchers WHERE id = ?`, [id]);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (req.user.role === 'employee' && voucher.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own vouchers.' });
    }

    if (req.user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Only the employee author can delete a draft voucher.',
      });
    }

    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete voucher in '${voucher.status}' status. Only Draft vouchers can be deleted.`,
      });
    }

    await run(`DELETE FROM vouchers WHERE id = ?`, [id]);
    return res.status(200).json({
      success: true,
      message: `Voucher ${voucher.voucher_number} deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 4. Submit Voucher for Approval
 * Rule #12: Every submitted voucher must include the employee's signature.
 * Validation: Employee signature is mandatory before submission.
 */
const submitVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { signature_url, signatureData } = req.body;

    const voucher = await get(`SELECT * FROM vouchers WHERE id = ?`, [id]);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only submit your own vouchers.' });
    }

    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Only Draft vouchers can be submitted. Current status: '${voucher.status}'.`,
      });
    }

    // Determine employee signature
    let finalSignatureUrl = signature_url || voucher.employee_signature_url;
    if (signatureData) {
      finalSignatureUrl = saveBase64Image(signatureData, `emp-sig-${req.user.id}`);
    }

    // Validation rule: Employee Signature is mandatory before submission
    if (!finalSignatureUrl) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Employee signature is mandatory before submission.',
      });
    }

    await run(
      `UPDATE vouchers SET
        status = 'Submitted',
        employee_signature_url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [finalSignatureUrl, id]
    );

    const updated = await get(`SELECT * FROM vouchers WHERE id = ?`, [id]);
    await logAudit(id, 'SUBMITTED', req.user, 'Submitted for Director approval with employee signature');

    return res.status(200).json({
      success: true,
      message: 'Voucher submitted successfully for Director approval',
      voucher: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 5. Approve Voucher (Director only)
 * Rule #6: Only the Director can approve or reject submitted vouchers.
 * Rule #13: Every approved voucher must include the Director's signature.
 * Rule #7: Approved vouchers become read-only.
 * Validation: Director Signature is mandatory before approval.
 */
const approveVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { signature_url, signatureData } = req.body;

    const voucher = await get(`SELECT * FROM vouchers WHERE id = ?`, [id]);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve voucher in '${voucher.status}' status. Only 'Submitted' vouchers pending approval can be approved.`,
      });
    }

    // Resolve director signature
    let finalSignatureUrl = signature_url || req.user.signature_url;
    if (signatureData) {
      finalSignatureUrl = saveBase64Image(signatureData, `dir-sig-${req.user.id}`);
    }

    // Validation: Director Signature is mandatory before approval
    if (!finalSignatureUrl) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Director signature is mandatory before approval.',
      });
    }

    const nowIso = new Date().toISOString();

    await run(
      `UPDATE vouchers SET
        status = 'Approved',
        director_id = ?,
        director_name = ?,
        director_signature_url = ?,
        approval_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [req.user.id, req.user.name, finalSignatureUrl, nowIso, id]
    );

    const updated = await get(`SELECT * FROM vouchers WHERE id = ?`, [id]);
    await logAudit(id, 'APPROVED', req.user, 'Voucher approved and forwarded to Accounts Team');

    return res.status(200).json({
      success: true,
      message: 'Voucher approved successfully with Director signature',
      voucher: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 6. Reject Voucher (Director only)
 * Rule #6: Only the Director can approve or reject submitted vouchers.
 * Rule #8: Rejected vouchers must include a rejection reason.
 * Validation: Rejection Reason is mandatory if a voucher is rejected.
 */
const rejectVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    const voucher = await get(`SELECT * FROM vouchers WHERE id = ?`, [id]);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject voucher in '${voucher.status}' status. Only 'Submitted' vouchers can be rejected.`,
      });
    }

    // Validation: Rejection Reason is mandatory if a voucher is rejected
    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Rejection Reason is mandatory if a voucher is rejected.',
      });
    }

    await run(
      `UPDATE vouchers SET
        status = 'Rejected',
        director_id = ?,
        director_name = ?,
        rejection_reason = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [req.user.id, req.user.name, rejection_reason.trim(), id]
    );

    const updated = await get(`SELECT * FROM vouchers WHERE id = ?`, [id]);
    await logAudit(id, 'REJECTED', req.user, `Rejected: ${rejection_reason.trim()}`);

    return res.status(200).json({
      success: true,
      message: 'Voucher rejected successfully with provided reason',
      voucher: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 7. Get Vouchers List
 * Rule #9: Employees can only view vouchers created by themselves.
 * Rule #10: The Director can view every voucher in the organization.
 * Rule #11: The Accounts Team can view every voucher in the organization.
 * Section 7: Search and filter by voucher number, employee name, department,
 * expense category, status, date range, amount range, and sorting.
 */
const getVouchers = async (req, res, next) => {
  try {
    const {
      search,
      voucher_number,
      employee_name,
      department,
      expense_category,
      status,
      date_from,
      date_to,
      min_amount,
      max_amount,
      sortBy = 'id',
      order = 'DESC',
      page = 1,
      limit = 50,
    } = req.query;

    let conditions = [];
    let params = [];

    // Role-based visibility
    if (req.user.role === 'employee') {
      conditions.push('user_id = ?');
      params.push(req.user.id);
    }

    // General text search
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        '(voucher_number LIKE ? OR expense_title LIKE ? OR employee_name LIKE ? OR department_name LIKE ?)'
      );
      params.push(term, term, term, term);
    }

    // Specific filters
    if (voucher_number && voucher_number.trim()) {
      conditions.push('voucher_number LIKE ?');
      params.push(`%${voucher_number.trim()}%`);
    }

    if (employee_name && employee_name.trim()) {
      conditions.push('employee_name LIKE ?');
      params.push(`%${employee_name.trim()}%`);
    }

    if (department && department.trim()) {
      conditions.push('department_name = ?');
      params.push(department.trim());
    }

    if (expense_category && expense_category.trim()) {
      conditions.push('expense_category = ?');
      params.push(expense_category.trim());
    }

    if (status && status.trim()) {
      conditions.push('status = ?');
      params.push(status.trim());
    }

    if (date_from) {
      conditions.push('expense_date >= ?');
      params.push(date_from);
    }

    if (date_to) {
      conditions.push('expense_date <= ?');
      params.push(date_to);
    }

    if (min_amount) {
      conditions.push('amount >= ?');
      params.push(parseFloat(min_amount));
    }

    if (max_amount) {
      conditions.push('amount <= ?');
      params.push(parseFloat(max_amount));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Allowed sort columns
    const allowedSortFields = {
      id: 'id',
      voucher_number: 'voucher_number',
      voucher_date: 'voucher_date',
      expense_date: 'expense_date',
      amount: 'amount',
      status: 'status',
      created_at: 'created_at',
      employee_name: 'employee_name',
      department_name: 'department_name',
    };
    const sortColumn = allowedSortFields[sortBy] || 'id';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total matches
    const countResult = await get(
      `SELECT COUNT(*) as total FROM vouchers ${whereClause}`,
      params
    );
    const total = countResult ? countResult.total : 0;

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const queryParams = [...params, parseInt(limit, 10), offset];

    const vouchers = await query(
      `SELECT * FROM vouchers ${whereClause} ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`,
      queryParams
    );

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      vouchers,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 8. Get Voucher By ID
 * With full detail and audit history
 */
const getVoucherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const voucher = await get(`SELECT * FROM vouchers WHERE id = ?`, [id]);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    // Role check: Employees can only view vouchers created by themselves
    if (req.user.role === 'employee' && voucher.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view vouchers created by yourself.',
      });
    }

    // Fetch audit trail
    const auditLogs = await query(
      `SELECT * FROM voucher_audit_logs WHERE voucher_id = ? ORDER BY timestamp ASC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      voucher,
      auditLogs,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 9. Upload Signature Endpoint
 * Supports file upload or base64 JSON payload
 */
const uploadSignature = async (req, res, next) => {
  try {
    let signatureUrl = null;

    if (req.file) {
      signatureUrl = `/uploads/signatures/${req.file.filename}`;
    } else if (req.body.signatureData) {
      signatureUrl = saveBase64Image(req.body.signatureData, `sig-${req.user.id}`);
    }

    if (!signatureUrl) {
      return res.status(400).json({
        success: false,
        message: 'No image file or signature data provided.',
      });
    }

    return res.status(200).json({
      success: true,
      signatureUrl,
      message: 'Signature uploaded successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createVoucher,
  updateVoucher,
  deleteVoucher,
  submitVoucher,
  approveVoucher,
  rejectVoucher,
  getVouchers,
  getVoucherById,
  uploadSignature,
};
