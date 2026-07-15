import * as React from "react";
import { cn } from "@/lib/utils";
import type { PillarSlug } from "@/lib/site-config";

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
