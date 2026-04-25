"use client"

import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

export function Progress({
  value,
  max = 100,
  className,
}: {
  value?: number;
  max?: number;
  className?: string;
}) {
  const percentage = value ?? 0;
  const transformValue = 100 - (percentage / max) * 100;
  
  return (
  <ProgressPrimitive.Root
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
      value={percentage}
      max={max}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all"
        style={{ transform: `translateX(-${transformValue}%)` }}
    />
  </ProgressPrimitive.Root>
  );
}

