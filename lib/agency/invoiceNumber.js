import Invoice from '@/models/Invoice';

/**
 * Invoice Number Generator
 * 
 * Auto-generates unique invoice numbers.
 * 
 * FORMAT: INV-YYYYMM-HHHH-XXXXX
 * - YYYY: Year
 * - MM: Month (01-12)
 * - HHHH: Agency identifier (last 4 chars of ID)
 * - XXXXX: Sequential number (00001-99999)
 * 
 * RULES:
 * - Unique globally
 * - Sequential within agency/month
 * - Never reused
 * 
 * ISOLATION: Pure logic + DB query
 */

/**
 * Generate next invoice number for an agency
 * @param {string} agencyId - Agency ID
 * @returns {Promise<string>} - Generated invoice number
 */
export async function generateInvoiceNumber(agencyId) {
  if (!agencyId) {
    throw new Error('Agency ID is required');
  }
  
  return await Invoice.generateInvoiceNumber(agencyId);
}

/**
 * Parse invoice number into components
 * @param {string} invoiceNumber - Invoice number to parse
 * @returns {object|null} - Parsed components or null if invalid
 */
export function parseInvoiceNumber(invoiceNumber) {
  if (!invoiceNumber || typeof invoiceNumber !== 'string') {
    return null;
  }
  
  const pattern = /^INV-(\d{6})-([0-9a-f]{4})-(\d{5})$/;
  const match = invoiceNumber.match(pattern);
  
  if (!match) {
    return null;
  }
  
  const yearMonth = match[1];
  const agencyHash = match[2];
  const sequence = match[3];
  
  return {
    year: parseInt(yearMonth.substring(0, 4)),
    month: parseInt(yearMonth.substring(4, 6)),
    agencyHash,
    sequence: parseInt(sequence),
    raw: invoiceNumber
  };
}

/**
 * Validate invoice number format
 * @param {string} invoiceNumber - Invoice number to validate
 * @returns {boolean} - True if valid format
 */
export function isValidInvoiceNumber(invoiceNumber) {
  return parseInvoiceNumber(invoiceNumber) !== null;
}

/**
 * Generate invoice number for specific month (for testing/migration)
 * @param {string} agencyId - Agency ID
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Promise<string>} - Generated invoice number
 */
export async function generateInvoiceNumberForMonth(agencyId, year, month) {
  if (!agencyId) {
    throw new Error('Agency ID is required');
  }
  
  if (!year || !month || month < 1 || month > 12) {
    throw new Error('Invalid year or month');
  }
  
  const yearMonth = `${year}${String(month).padStart(2, '0')}`;
  const agencySuffix = agencyId.toString().slice(-4);
  
  // Find the last invoice for this agency in this month
  const lastInvoice = await Invoice.findOne({
    agencyId,
    invoiceNumber: new RegExp(`^INV-${yearMonth}-${agencySuffix}-`)
  }).sort({ invoiceNumber: -1 });
  
  let sequence = 1;
  if (lastInvoice) {
    const parsed = parseInvoiceNumber(lastInvoice.invoiceNumber);
    if (parsed) {
      sequence = parsed.sequence + 1;
    }
  }
  
  return `INV-${yearMonth}-${agencySuffix}-${String(sequence).padStart(5, '0')}`;
}
