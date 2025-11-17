/**
 * Platform Shadow Utilities
 *
 * Provides consistent shadow styles across iOS and Android platforms.
 * iOS uses shadowColor/shadowOffset/shadowOpacity/shadowRadius,
 * Android uses elevation.
 *
 * Usage:
 * import { createShadow } from '@/theme/shadows';
 * const shadowStyle = createShadow(4);
 *
 * @module theme/shadows
 */

import { Platform, ViewStyle } from 'react-native';

/**
 * Shadow configuration interface
 */
interface ShadowConfig {
  elevation: number;
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
}

/**
 * Creates platform-specific shadow styles
 *
 * @param elevation - Shadow elevation (1-24)
 * @param color - Shadow color (default: '#000')
 * @returns ViewStyle object with platform-specific shadow properties
 */
export const createShadow = (
  elevation: number,
  color: string = '#000'
): ViewStyle => {
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.1 + elevation * 0.02,
      shadowRadius: elevation,
    },
    android: {
      elevation,
    },
  }) as ViewStyle;
};

/**
 * Predefined shadow presets for common use cases
 */
export const SHADOWS = {
  none: createShadow(0),
  small: createShadow(2),
  medium: createShadow(4),
  large: createShadow(8),
  xl: createShadow(12),
} as const;

/**
 * Card shadow - commonly used for card components
 */
export const cardShadow = createShadow(4, '#000');

/**
 * FAB (Floating Action Button) shadow
 */
export const fabShadow = createShadow(8, '#FF9800');

/**
 * Modal shadow
 */
export const modalShadow = createShadow(16, '#000');
