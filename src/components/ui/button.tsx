import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive stealth-ops:rounded-sm stealth-ops:font-mono stealth-ops:tracking-wide stealth-ops:font-semibold",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 stealth-ops:bg-gradient-to-r stealth-ops:from-green-600 stealth-ops:to-green-500 stealth-ops:text-black stealth-ops:hover:from-green-500 stealth-ops:hover:to-green-400 stealth-ops:border stealth-ops:border-green-400 stealth-ops:shadow-lg stealth-ops:shadow-green-500/25",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 stealth-ops:bg-gradient-to-r stealth-ops:from-red-600 stealth-ops:to-red-500 stealth-ops:hover:from-red-500 stealth-ops:hover:to-red-400 stealth-ops:border stealth-ops:border-red-400 stealth-ops:shadow-lg stealth-ops:shadow-red-500/25",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 stealth-ops:bg-black stealth-ops:border-gray-600 stealth-ops:text-white stealth-ops:hover:bg-gray-900 stealth-ops:hover:border-green-400 stealth-ops:hover:shadow-lg stealth-ops:hover:shadow-green-500/20",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 stealth-ops:bg-gray-800 stealth-ops:text-gray-300 stealth-ops:hover:bg-gray-700 stealth-ops:border stealth-ops:border-gray-600 stealth-ops:hover:border-gray-500",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 stealth-ops:hover:bg-gray-900 stealth-ops:text-gray-300 stealth-ops:hover:text-white",
        link: "text-primary underline-offset-4 hover:underline stealth-ops:text-green-400 stealth-ops:hover:text-green-300",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 stealth-ops:rounded-sm",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4 stealth-ops:rounded-sm",
        icon: "size-9 rounded-md stealth-ops:rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
