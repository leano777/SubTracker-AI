import type { Variants } from "framer-motion";

// Motion variants for consistent animations across components
export const motionVariants: Record<string, Variants> = {
  "fade-in": {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  // Route transition variants
  "route-fade": {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  "route-slide": {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  },
  "route-scale": {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  "slide-up": {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
  },
  "scale-in": {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  // Dialog specific variants
  "dialog-overlay": {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "dialog-content": {
    initial: { opacity: 0, scale: 0.95, y: -8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -8 },
  },
  // Sheet specific variants
  "sheet-slide-right": {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
  },
  "sheet-slide-left": {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
  },
  "sheet-slide-up": {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
  },
  "sheet-slide-down": {
    initial: { y: "-100%" },
    animate: { y: 0 },
    exit: { y: "-100%" },
  },
  // Tooltip specific variants
  "tooltip": {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  // Select dropdown variants
  "select-content": {
    initial: { opacity: 0, y: -4, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -4, scale: 0.95 },
  },
};

// Default transition configuration
export const defaultTransition = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1] as any, // easeOut bezier curve
};

// Spring transition for more dynamic animations
export const springTransition = {
  type: "spring",
  damping: 25,
  stiffness: 300,
};

// Motion types for component props
export type MotionVariant = keyof typeof motionVariants;
