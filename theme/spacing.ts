/**
 * Global Spacing Constants
 *
 * Consistent spacing scale for margins, padding, and gaps.
 * Based on 8px grid system for better visual harmony.
 *
 * Usage:
 * import { SPACING } from '@/theme/spacing';
 * paddingHorizontal: SPACING.md,
 *
 * @module theme/spacing
 */

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Border radius constants
 */
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;
