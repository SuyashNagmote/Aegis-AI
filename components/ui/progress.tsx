"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/src/lib/utils";

export function Progress({
  value,
  className
}: {
  value: number;
  className?: string;
}) {
  return (
    <ProgressPrimitive.Root
      className={cn("relative h-3 w-full overflow-hidden rounded-full bg-white/10", className)}
      value={value}
    >
      <ProgressPrimitive.Indicator
        className="h-full bg-gradient-to-r from-primary via-warning to-danger transition-all"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
