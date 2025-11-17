/**
 * Theme System Entry Point
 *
 * Exports all theme-related constants and utilities.
 * Import from this file for convenient access to the entire theme system.
 *
 * Usage:
 * import { COLORS, SHADOWS, SPACING, RADIUS } from '@/theme';
 *
 * @module theme
 */

export { COLORS, type ColorKey } from './colors';
export { createShadow, SHADOWS, cardShadow, fabShadow, modalShadow } from './shadows';
export { SPACING, RADIUS } from './spacing';
