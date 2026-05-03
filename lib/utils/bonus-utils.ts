/**
 * Calculate bonus percentage based on deposit amount
 * Tiered bonus: higher deposits get higher percentage
 * Note: Admin can override this with manual bonus percentage (0-100%)
 */
export function calculateBonusPercentage(amount: number): number {
  if (amount >= 10000000) return 5;
  if (amount >= 5000000) return 3;
  if (amount >= 1000000) return 2;
  if (amount >= 500000) return 1.5;
  if (amount >= 100000) return 1;
  return 0;
}

/**
 * Get bonus tier label
 */
export function getBonusTierLabel(percentage: number): string {
  if (percentage >= 100) return 'VIP - 100%';
  if (percentage >= 50) return 'Exclusive';
  if (percentage >= 20) return 'Premium';
  if (percentage >= 10) return 'Gold';
  if (percentage >= 5) return 'Platinum';
  if (percentage >= 3) return 'Gold';
  if (percentage >= 2) return 'Silver';
  if (percentage >= 1.5) return 'Bronze';
  if (percentage >= 1) return 'Basic';
  return 'None';
}

/**
 * Get minimum amount needed for next tier (auto tier only)
 */
export function getNextTierAmount(currentAmount: number): number {
  if (currentAmount < 100000) return 100000;
  if (currentAmount < 500000) return 500000;
  if (currentAmount < 1000000) return 1000000;
  if (currentAmount < 5000000) return 5000000;
  if (currentAmount < 10000000) return 10000000;
  return currentAmount; // Already at max tier
}
