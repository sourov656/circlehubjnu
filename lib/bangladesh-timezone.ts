/**
 * Utility functions for Bangladesh timezone (UTC+6) handling
 */

export const BANGLADESH_TIMEZONE = "Asia/Dhaka";
export const BANGLADESH_OFFSET_HOURS = 6;

/**
 * Get current date in Bangladesh timezone
 */
export function getCurrentBangladeshDate(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: BANGLADESH_TIMEZONE })
  );
}

/**
 * Convert date to Bangladesh timezone
 */
export function toBangladeshDate(date: Date): Date {
  return new Date(
    date.toLocaleString("en-US", { timeZone: BANGLADESH_TIMEZONE })
  );
}

/**
 * Format date string for Bangladesh timezone (YYYY-MM-DD)
 */
export function formatDateForBangladesh(date: Date): string {
  const bdDate = toBangladeshDate(date);
  const year = bdDate.getFullYear();
  const month = String(bdDate.getMonth() + 1).padStart(2, "0");
  const day = String(bdDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse date string considering Bangladesh timezone
 */
export function parseDateFromBangladesh(dateString: string): Date {
  // Parse as local Bangladesh time
  const [year, month, day] = dateString.split("-").map(Number);

  // Create date in Bangladesh timezone
  const bdDate = new Date();
  bdDate.setFullYear(year, month - 1, day);
  bdDate.setHours(0, 0, 0, 0);

  return bdDate;
}

/**
 * Get today's date in Bangladesh timezone formatted as YYYY-MM-DD
 */
export function getTodayInBangladesh(): string {
  return formatDateForBangladesh(getCurrentBangladeshDate());
}

/**
 * Check if a date string is today in Bangladesh timezone
 */
export function isTodayInBangladesh(dateString: string): boolean {
  return dateString === getTodayInBangladesh();
}
