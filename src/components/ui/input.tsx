import { motion } from "framer-motion";
import * as React from "react";

import { cn } from "./utils";
import { defaultTransition, motionVariants, type MotionVariant } from "./motion";
import { prefersReducedMotion } from "../../utils/accessibility/focusManagement";

interface InputProps extends React.ComponentProps<"input"> {
  /**
   * Motion variant for animations
   * @default "fade-in"
   */
  motionVariant?: MotionVariant;
  /**
   * Disable motion animations
   * @default false
   */
  disableMotion?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, motionVariant = "fade-in", disableMotion = false, ...props }, ref) => {
    const shouldDisableMotion = disableMotion || prefersReducedMotion();
    
    // Enhanced accessibility props
    const accessibilityProps = {
      // Ensure proper input type
      type: type || "text",
      // Add autocomplete hints for common input types
      ...(type === "email" && !props.autoComplete && { autoComplete: "email" }),
      ...(type === "password" && !props.autoComplete && { autoComplete: "current-password" }),
      ...(type === "tel" && !props.autoComplete && { autoComplete: "tel" }),
      // Enhanced focus visibility
      'data-focus-visible': true,
    };
    
    const inputElement = (
      <input
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          // Enhanced focus styles for better accessibility
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400",
          // High contrast mode support
          "contrast-more:border-2 contrast-more:border-current",
          // Touch target size for mobile
          "min-h-[44px] touch:min-h-[44px]",
          // Stealth ops theme
          "stealth-ops:rounded-sm stealth-ops:bg-black stealth-ops:border-gray-600 stealth-ops:text-white stealth-ops:font-mono stealth-ops:tracking-wide stealth-ops:placeholder:text-gray-500",
          "stealth-ops:focus-visible:border-green-400 stealth-ops:focus-visible:ring-green-400/30 stealth-ops:focus-visible:ring-[2px] stealth-ops:focus-visible:shadow-lg stealth-ops:focus-visible:shadow-green-500/20",
          className
        )}
        ref={ref}
        {...accessibilityProps}
        {...props}
      />
    );

    if (shouldDisableMotion) {
      return inputElement;
    }

    return (
      <motion.div
        variants={motionVariants[motionVariant]}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={defaultTransition}
      >
        {inputElement}
      </motion.div>
    );
  }
);

Input.displayName = "Input";

export { Input };
