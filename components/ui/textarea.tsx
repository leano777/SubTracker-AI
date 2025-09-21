import * as React from "react";

import { cn } from "./utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        data-slot="textarea"
        className={cn(
          "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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

Textarea.displayName = "Textarea";

export { Textarea };