"use client";

import {
  RangeContext,
  useRangeContext,
  type ActiveHandle,
  type RangeContextValue,
} from "@/app/components/range/context";
import { RangePropsSchema } from "@/app/components/range/schema";
import { clamp, roundToStep } from "@/app/components/range/utils";
import type { ChangeEvent, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import * as z from "zod/mini";

type RangeInputProps = React.ComponentProps<"input"> & {
  handle: Exclude<ActiveHandle, null>;
  label?: string;
};
const Input = ({ handle, label, ...props }: RangeInputProps) => {
  const { value, updateValue, continuousMin, continuousMax, step } =
    useRangeContext();
  const currentValue = handle === "min" ? value[0] : value[1];
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [text, setText] = useState<string>(String(currentValue));

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setText(String(currentValue));
    }
  }, [currentValue]);

  const commit = useCallback(() => {
    const parsed = Number(text);
    if (!Number.isNaN(parsed)) {
      updateValue(handle, parsed);
      const normalized =
        handle === "min"
          ? roundToStep(clamp(parsed, continuousMin, value[1]), step)
          : roundToStep(clamp(parsed, value[0], continuousMax), step);
      setText(String(normalized));
    } else {
      setText(String(currentValue));
    }
  }, [
    text,
    handle,
    updateValue,
    currentValue,
    continuousMin,
    continuousMax,
    step,
    value,
  ]);

  return (
    <label>
      {label ? <span className="sr-only">{label}</span> : null}
      <input
        ref={inputRef}
        type="number"
        className="w-full appearance-none rounded-lg border border-slate-900/10 bg-white px-3 py-2 text-base font-medium text-slate-900 transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
        value={text}
        onChange={(e) => {
          const next = e.target.value;
          setText(next);
          if (next.trim() === "") return;
          const num = Number(next);
          if (!Number.isNaN(num)) {
            updateValue(handle, num);
          }
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commit();
            (e.target as HTMLInputElement).blur();
          } else if (e.key === "Escape") {
            setText(String(currentValue));
            (e.target as HTMLInputElement).blur();
          }
        }}
        onFocus={(event) => event.target.select()}
        aria-label={label}
        {...props}
      />
    </label>
  );
};

type RangeTrackProps = React.ComponentProps<"div">;
const Track = ({ children, ...props }: RangeTrackProps) => {
  const { trackRef } = useRangeContext();
  return (
    <div
      className="track relative m-auto mx-2.5 h-2 w-full rounded-full bg-linear-to-r from-slate-200/90 to-blue-200/90"
      ref={trackRef}
      {...props}
    >
      <Selected />
      <Thumb handle="min" />
      <Thumb handle="max" />
    </div>
  );
};

type SelectedProps = React.ComponentProps<"div">;
const Selected = (props: SelectedProps) => {
  const { value, getPercentForValue } = useRangeContext();
  const minPercent = getPercentForValue(value[0]);
  const maxPercent = getPercentForValue(value[1]);
  return (
    <div
      className="pointer-events-none absolute top-0 h-full rounded-full bg-linear-to-r from-blue-500 to-blue-600"
      style={{
        left: `${Math.min(minPercent, maxPercent)}%`,
        width: `${Math.abs(maxPercent - minPercent)}%`,
      }}
      {...props}
    />
  );
};

type ThumbProps = React.ComponentProps<"button"> & {
  handle: Exclude<ActiveHandle, null>;
};
const Thumb = ({ handle, ...props }: ThumbProps) => {
  const {
    activeHandle,
    value,
    continuousMin,
    continuousMax,
    getPercentForValue,
    handlePointerDownFactory,
  } = useRangeContext();
  const percent = getPercentForValue(handle === "min" ? value[0] : value[1]);
  const aria =
    handle === "min"
      ? {
          "aria-label": "Lower bound",
          "aria-valuemin": continuousMin,
          "aria-valuemax": value[1],
          "aria-valuenow": value[0],
        }
      : {
          "aria-label": "Upper bound",
          "aria-valuemin": value[0],
          "aria-valuemax": continuousMax,
          "aria-valuenow": value[1],
        };
  return (
    <button
      type="button"
      className="absolute top-1/2 size-5 -translate-1/2 cursor-grab rounded-full border-2 border-white bg-blue-500 shadow transition-[transform,shadow] hover:scale-110 data-[active=true]:cursor-grabbing"
      data-active={activeHandle === handle}
      style={{ left: `${percent}%` }}
      onPointerDown={handlePointerDownFactory(handle)}
      role="slider"
      {...aria}
      {...props}
    />
  );
};

type RangeProps = z.infer<typeof RangePropsSchema> & {
  step?: number;
  className?: string;
};
const Range = ({ min, max, step = 0.1, className }: RangeProps) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeHandle, setActiveHandle] = useState<ActiveHandle>(null);

  const [continuousMin, continuousMax] = useMemo(() => {
    const safeMin = Math.min(min, max);
    const safeMax = Math.max(min, max);
    return [safeMin, safeMax] as const;
  }, [min, max]);

  const [value, setValue] = useState<[number, number]>(() => [
    continuousMin,
    continuousMax,
  ]);

  const getPercentForValue = useCallback(
    (input: number) => {
      if (continuousMax === continuousMin) return 0;
      return ((input - continuousMin) / (continuousMax - continuousMin)) * 100;
    },
    [continuousMin, continuousMax],
  );

  const updateValue = useCallback(
    (handle: Exclude<ActiveHandle, null>, nextValue: number) => {
      setValue((current) => {
        let [currentMin, currentMax] = current;
        if (handle === "min") {
          const snapped = roundToStep(
            clamp(nextValue, continuousMin, currentMax),
            step,
          );
          currentMin = Math.min(snapped, currentMax);
        } else {
          const snapped = roundToStep(
            clamp(nextValue, currentMin, continuousMax),
            step,
          );
          currentMax = Math.max(snapped, currentMin);
        }
        return [currentMin, currentMax];
      });
    },
    [continuousMin, continuousMax, step],
  );

  const handlePointerMove = useCallback(
    (closeHandle: Exclude<ActiveHandle, null>, clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      if (!rect.width) return;
      const relative = clamp((clientX - rect.left) / rect.width, 0, 1);
      const candidate =
        continuousMin + relative * (continuousMax - continuousMin);
      updateValue(closeHandle, candidate);
    },
    [continuousMin, continuousMax, updateValue],
  );

  useEffect(() => {
    if (!activeHandle) return;
    const onPointerMove = (event: PointerEvent) => {
      handlePointerMove(activeHandle, event.clientX);
    };
    const onPointerUp = () => {
      setActiveHandle(null);
      document.body.style.cursor = "";
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.body.style.cursor = "";
    };
  }, [activeHandle, handlePointerMove]);

  const handlePointerDownFactory = useCallback(
    (handle: Exclude<ActiveHandle, null>) => {
      return (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setActiveHandle(handle);
        document.body.style.cursor = "grabbing";
      };
    },
    [],
  );

  const handleInputChangeFactory = useCallback(
    (handle: Exclude<ActiveHandle, null>) => {
      return (event: ChangeEvent<HTMLInputElement>) => {
        const next = Number(event.target.value);
        if (Number.isNaN(next)) return;
        updateValue(handle, next);
      };
    },
    [updateValue],
  );

  const ctx: RangeContextValue = useMemo(
    () => ({
      trackRef,
      value,
      setValue,
      continuousMin,
      continuousMax,
      step,
      getPercentForValue,
      updateValue,
      handlePointerDownFactory,
      handleInputChangeFactory,
      activeHandle,
    }),
    [
      trackRef,
      value,
      setValue,
      continuousMin,
      continuousMax,
      getPercentForValue,
      updateValue,
      handlePointerDownFactory,
      handleInputChangeFactory,
      activeHandle,
    ],
  );

  return (
    <RangeContext.Provider value={ctx}>
      <div
        className={twMerge("flex gap-4", className)}
        data-dragging={Boolean(activeHandle)}
      >
        <Input handle="min" label="Minimum value" />
        <Track />
        <Input handle="max" label="Maximum value" />
      </div>
    </RangeContext.Provider>
  );
};

export default Range;
