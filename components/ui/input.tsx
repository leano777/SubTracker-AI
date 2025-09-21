import * as React from "react";

import { cn } from "./utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "stealth-ops:rounded-sm stealth-ops:bg-black stealth-ops:border-gray-600 stealth-ops:text-white stealth-ops:font-mono stealth-ops:tracking-wide stealth-ops:placeholder:text-gray-500",
          "stealth-ops:focus-visible:border-green-400 stealth-ops:focus-visible:ring-green-400/30 stealth-ops:focus-visible:ring-[2px] stealth-ops:focus-visible:shadow-lg stealth-ops:focus-visible:shadow-green-500/20",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };