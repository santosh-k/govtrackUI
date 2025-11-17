/**
 * Global Color Theme
 *
 * Centralized color constants used throughout the application.
 * This ensures consistent styling and makes theme changes easier.
 *
 * Usage:
 * import { COLORS } from '@/theme/colors';
 *
 * @module theme/colors
 */

export const COLORS = {
  // Background colors
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',

  // Text colors
  text: '#1A1A1A',
  textSecondary: '#666666',

  // Primary/Brand colors
  primary: '#FF9800', // Orange/Saffron
  primaryBlue: '#2196F3',

  // UI element colors
  border: '#E0E0E0',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Additional semantic colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// Type for color keys (for TypeScript autocompletion)
export type ColorKey = keyof typeof COLORS;
