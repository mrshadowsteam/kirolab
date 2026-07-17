import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { PillarSlug } from "@/lib/site-config";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        // Teal — spokojna etykieta „zaufania"
        default: "bg-primary text-primary-foreground",
        // Bursztyn JAKO WYPEŁNIENIE + ciemny tekst (reguła kontrastu, design.md §8)
        accent: "bg-accent text-accent-foreground",
        // Obrys — neutralna etykieta na jasnym tle
        outline: "border border-border text-foreground",
        muted: "bg-muted text-muted-foreground",
        success: "bg-success text-white",
        // Ostrzeżenie/disclaimer — amber-700 (#B45309) jako tło, biały tekst (WCAG AA)
        warning: "bg-warning text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/** Ogólna odznaka bazowa z wariantami (design.md §8). */
export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

const pillarBg: Record<PillarSlug, string> = {
  kariera: "bg-pillar-kariera",
  "prawo-pracy": "bg-pillar-prawo-pracy",
  "prawa-konsumenta": "bg-pillar-prawa-konsumenta",
};

interface PillarBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  pillar: PillarSlug;
  label: string;
}

/** Odznaka filaru — kolorowe wypełnienie z białym tekstem (kontrast AA). */
export function PillarBadge({
  pillar,
  label,
  className,
  ...props
}: PillarBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white",
        pillarBg[pillar],
        className,
      )}
      {...props}
    >
      {label}
    </span>
  );
}

export { badgeVariants };
