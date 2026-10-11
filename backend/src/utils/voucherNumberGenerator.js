const { get } = require('../config/db');

/**
 * Generate a unique sequential voucher number in format EV-YYYYMM-XXXX
 * Example: EV-202610-0001
 */
const generateVoucherNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `EV-${year}${month}-`;

  // Find the highest existing voucher number with this prefix
  const result = await get(
    `SELECT voucher_number FROM vouchers WHERE voucher_number LIKE ? ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let nextSequence = 1;
  if (result && result.voucher_number) {
    const parts = result.voucher_number.split('-');
    if (parts.length >= 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  const voucherNumber = `${prefix}${String(nextSequence).padStart(4, '0')}`;
  return voucherNumber;
};

module.exports = {
  generateVoucherNumber,
};
