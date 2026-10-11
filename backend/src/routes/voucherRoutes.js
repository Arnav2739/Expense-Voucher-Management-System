const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// All voucher routes require authentication
router.use(authenticate);

// 1. Signature file upload endpoint (available to employees and directors)
router.post(
  '/upload-signature',
  upload.single('signature'),
  voucherController.uploadSignature
);

// 2. Voucher Listing & Single Retrieval
// Employee views own vouchers; Director and Accounts view all vouchers
router.get('/', voucherController.getVouchers);
router.get('/:id', voucherController.getVoucherById);

// 3. Employee voucher lifecycle operations
// - Create voucher (initially Draft)
router.post('/', authorizeRoles('employee'), voucherController.createVoucher);

// - Edit draft voucher
router.put('/:id', authorizeRoles('employee'), voucherController.updateVoucher);

// - Delete draft voucher
router.delete('/:id', authorizeRoles('employee'), voucherController.deleteVoucher);

// - Submit draft voucher for approval
router.post('/:id/submit', authorizeRoles('employee'), voucherController.submitVoucher);

// 4. Director voucher approval operations
// - Approve voucher (requires director signature)
router.post('/:id/approve', authorizeRoles('director'), voucherController.approveVoucher);

// - Reject voucher (requires rejection reason)
router.post('/:id/reject', authorizeRoles('director'), voucherController.rejectVoucher);

module.exports = router;
