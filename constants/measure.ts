import { PixelRatio } from "react-native";

// Define your base sizes for 1x screens
export const sizes = {
  xxs: 8, // Extra small size
  xs: 12, // Small size
  sm: 16, // Medium size
  md: 20, // Default for medium-sized elements
  lg: 28, // Large size
  xl: 36, // Extra-large size
  xxl: 48, // Extra-extra-large size
} as const;

// Helper function to scale sizes based on device's pixel density
export const sizing = (size: Size): number => {
  const pixelRatio = PixelRatio.get();

  // Define scaling factors for different screen densities
  let scaleFactor: number;

  if (pixelRatio >= 3) {
    scaleFactor = 1.4; // For 3x (or higher) screens
  } else if (pixelRatio >= 2) {
    scaleFactor = 1.2; // For 2x screens
  } else {
    scaleFactor = 1; // For 1x screens
  }

  // Calculate and return the scaled size
  return Math.round(sizes[size] * scaleFactor);
};

export type Size = keyof typeof sizes;

export const spacingVal = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 18, // standard padding from edge of screen
  lg: 24,
  xl: 32,
  xxl: 56,
} as const;

// The type for spacing keys (xxs, xs, sm, etc.)
export type SpacingType = keyof typeof spacingVal;

// Precompute scaled spacing values for different pixel densities
export const spacing = Object.fromEntries(
  Object.entries(spacingVal).map(([key, value]) => {
    const pixelRatio = PixelRatio.get();
    let scaleFactor = 1;

    if (pixelRatio >= 3) {
      scaleFactor = 1.5; // For 3x (or higher) screens
    } else if (pixelRatio >= 2) {
      scaleFactor = 1.25; // For 2x screens
    }

    return [key, Math.round(value * scaleFactor)];
  })
) as typeof spacingVal;

export const corner = {
  none: 0, // No rounding
  sm: 4, // Small rounding
  md: 8, // Medium rounding (common for cards)
  lg: 16, // Large rounding (e.g., modals, banners)
  xl: 24, // Extra-large rounding
  full: 9999, // Full rounding (e.g., circular avatars)
} as const;

// Scaled corner object to handle different pixel densities
export const scaledCorner = Object.fromEntries(
  Object.entries(corner).map(([key, value]) => [
    key,
    Math.round(value * PixelRatio.get()),
  ])
) as typeof corner;
