"use client";

import { RangeContext } from "@/app/components/range/context/context";
import { useRangeContext } from "@/app/components/range/context/useRangeContext";
import { type RangeProps } from "@/app/components/range/types/schema";
import Input from "@/components/range/ui/Input";
import Track from "@/components/range/ui/Track";
import { twMerge } from "tailwind-merge";

const Range = ({ className, ...props }: RangeProps) => {
  const ctx = useRangeContext(props);

  return (
    <RangeContext.Provider value={ctx}>
      <div
        className={twMerge(
          "flex flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:gap-8",
          className,
        )}
        data-dragging={Boolean(ctx.activeHandle)}
      >
        <Input
          handle="min"
          label="Minimum value"
          disabled={ctx.mode === "fixed"}
        />
        <Track />
        <Input
          handle="max"
          label="Maximum value"
          disabled={ctx.mode === "fixed"}
        />
      </div>
    </RangeContext.Provider>
  );
};

export default Range;
