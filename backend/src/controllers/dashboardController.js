const { query, get } = require('../config/db');

/**
 * Controller for role-specific dashboard metrics and summaries
 * Strictly adheres to Section 8 of the requirements
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // ==========================================
    // 1. EMPLOYEE DASHBOARD
    // ==========================================
    if (userRole === 'employee') {
      const stats = await get(
        `SELECT
          COUNT(*) as total_vouchers,
          SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) as draft_vouchers,
          SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) as pending_approval,
          SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved_vouchers,
          SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected_vouchers,
          COALESCE(SUM(amount), 0) as total_amount_claimed,
          COALESCE(SUM(CASE WHEN status = 'Approved' THEN amount ELSE 0 END), 0) as approved_amount
        FROM vouchers
        WHERE user_id = ?`,
        [userId]
      );

      const recentVouchers = await query(
        `SELECT * FROM vouchers WHERE user_id = ? ORDER BY id DESC LIMIT 5`,
        [userId]
      );

      return res.status(200).json({
        success: true,
        role: 'employee',
        stats: {
          totalVouchers: stats.total_vouchers || 0,
          draftVouchers: stats.draft_vouchers || 0,
          pendingApproval: stats.pending_approval || 0,
          approvedVouchers: stats.approved_vouchers || 0,
          rejectedVouchers: stats.rejected_vouchers || 0,
          totalAmountClaimed: Number((stats.total_amount_claimed || 0).toFixed(2)),
          approvedAmount: Number((stats.approved_amount || 0).toFixed(2)),
        },
        recentVouchers,
      });
    }

    // ==========================================
    // 2. DIRECTOR DASHBOARD
    // ==========================================
    if (userRole === 'director') {
      const pendingStats = await get(
        `SELECT
          COUNT(*) as pending_count,
          COALESCE(SUM(amount), 0) as total_pending_amount
        FROM vouchers
        WHERE status = 'Submitted'`
      );

      // Approved Today (date substring match)
      const approvedTodayRes = await get(
        `SELECT COUNT(*) as approved_today
         FROM vouchers
         WHERE status = 'Approved' AND approval_date LIKE ?`,
        [`${today}%`]
      );

      // Rejected Today (by checking updated_at date or audit logs)
      const rejectedTodayRes = await get(
        `SELECT COUNT(*) as rejected_today
         FROM vouchers
         WHERE status = 'Rejected' AND updated_at LIKE ?`,
        [`${today}%`]
      );

      const overallStats = await get(
        `SELECT
          COUNT(*) as total_vouchers,
          SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as total_approved,
          SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as total_rejected
        FROM vouchers`
      );

      const recentActivity = await query(
        `SELECT * FROM vouchers ORDER BY updated_at DESC, id DESC LIMIT 6`
      );

      const pendingApprovalsList = await query(
        `SELECT * FROM vouchers WHERE status = 'Submitted' ORDER BY voucher_date ASC, id ASC LIMIT 5`
      );

      return res.status(200).json({
        success: true,
        role: 'director',
        stats: {
          pendingApprovalCount: pendingStats.pending_count || 0,
          approvedToday: approvedTodayRes.approved_today || 0,
          rejectedToday: rejectedTodayRes.rejected_today || 0,
          totalPendingAmount: Number((pendingStats.total_pending_amount || 0).toFixed(2)),
          totalVouchers: overallStats.total_vouchers || 0,
          totalApproved: overallStats.total_approved || 0,
          totalRejected: overallStats.total_rejected || 0,
        },
        recentActivity,
        pendingApprovalsList,
      });
    }

    // ==========================================
    // 3. ACCOUNTS DASHBOARD
    // ==========================================
    if (userRole === 'accounts') {
      const stats = await get(
        `SELECT
          COUNT(*) as total_vouchers,
          SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) as pending_approval,
          SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved_vouchers,
          SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected_vouchers,
          COALESCE(SUM(CASE WHEN status = 'Approved' THEN amount ELSE 0 END), 0) as total_approved_amount,
          COALESCE(SUM(amount), 0) as total_org_amount
        FROM vouchers`
      );

      const recentApprovedVouchers = await query(
        `SELECT * FROM vouchers WHERE status = 'Approved' ORDER BY approval_date DESC, id DESC LIMIT 6`
      );

      return res.status(200).json({
        success: true,
        role: 'accounts',
        stats: {
          totalVouchers: stats.total_vouchers || 0,
          pendingApproval: stats.pending_approval || 0,
          approvedVouchers: stats.approved_vouchers || 0,
          rejectedVouchers: stats.rejected_vouchers || 0,
          totalApprovedExpenseAmount: Number((stats.total_approved_amount || 0).toFixed(2)),
          totalOrganizationExpenses: Number((stats.total_org_amount || 0).toFixed(2)),
        },
        recentApprovedVouchers,
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Unknown role',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
};
