"use client";

import {
  RangeContext,
  useRangeContext,
  type ActiveHandle,
  type RangeContextValue,
  type RangeMode,
} from "@/app/components/range/context";
import { type RangeProps } from "@/app/components/range/schema";
import {
  clamp,
  findNearestFixedValue,
  formatCurrency,
  getAdjacentFixedValue,
  roundToStep,
} from "@/app/components/range/utils";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

type RangeInputProps = React.ComponentProps<"input"> & {
  handle: Exclude<ActiveHandle, null>;
  label: string;
};
const Input = ({ handle, label, ...props }: RangeInputProps) => {
  const {
    value,
    updateValue,
    continuousMin,
    continuousMax,
    step,
    inputsText,
    setInputsText,
  } = useRangeContext();

  const currentValue = handle === "min" ? value[0] : value[1];
  const inputRef = useRef<HTMLInputElement | null>(null);

  const text = inputsText[handle];
  const setText = useCallback(
    (text: string) =>
      setInputsText((current) => ({
        ...current,
        [handle]: text,
      })),
    [setInputsText, handle],
  );

  const commitTextChange = useCallback(() => {
    const parsed = Number(text);
    if (Number.isNaN(parsed)) {
      setText(String(currentValue));
      return;
    }

    updateValue(handle, parsed);

    const min = handle === "min" ? continuousMin : value[0];
    const max = handle === "max" ? continuousMax : value[1];
    const normalized = roundToStep(clamp(parsed, min, max), step);
    setText(String(normalized));
  }, [
    text,
    updateValue,
    handle,
    continuousMin,
    value,
    continuousMax,
    step,
    setText,
    currentValue,
  ]);

  return (
    <label>
      <span className="sr-only">{label}</span>
      <input
        ref={inputRef}
        type="number"
        className="w-full max-w-[10ch] appearance-none rounded-lg border border-slate-900/10 bg-white px-3 py-2 text-base font-medium text-slate-900 transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
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
        onBlur={commitTextChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commitTextChange();
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
const Track = (props: RangeTrackProps) => {
  const { trackRef, mode, fixedValues } = useRangeContext();
  return (
    <div className="relative mx-2.5 my-auto flex-1">
      <div
        className="track relative h-2 w-full rounded-full bg-linear-to-r from-slate-200/90 to-blue-200/90"
        ref={trackRef}
        {...props}
      >
        <Indicator />
        <Thumb handle="min" />
        <Thumb handle="max" />
      </div>
      {mode === "fixed" && fixedValues && (
        <FixedValueLabels values={fixedValues} />
      )}
    </div>
  );
};

type FixedValueLabelsProps = {
  values: number[];
};
const FixedValueLabels = ({ values }: FixedValueLabelsProps) => {
  const { getPercentForValue } = useRangeContext();

  return (
    <div className="relative mt-2">
      {values.map((value, index) => {
        const percent = getPercentForValue(value);
        return (
          <div
            key={index}
            className="absolute -translate-x-1/2 text-xs text-slate-600"
            style={{ left: `${percent}%` }}
          >
            {formatCurrency(value)}
          </div>
        );
      })}
    </div>
  );
};

type IndicatorProps = React.ComponentProps<"div">;
const Indicator = (props: IndicatorProps) => {
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
    startGrabbing,
    handleKeyboardInput,
  } = useRangeContext();
  const percent = getPercentForValue(handle === "min" ? value[0] : value[1]);
  const aria = {
    "aria-label": handle === "min" ? "Lower bound" : "Upper bound",
    "aria-valuemin": handle === "min" ? continuousMin : value[0],
    "aria-valuemax": handle === "min" ? value[1] : continuousMax,
    "aria-valuenow": handle === "min" ? value[0] : value[1],
  };
  return (
    <button
      type="button"
      className="absolute top-1/2 size-5 -translate-1/2 cursor-grab rounded-full border-2 border-white bg-blue-500 shadow transition-[transform,shadow] hover:scale-110 focus:scale-110 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none data-[active=true]:scale-110 data-[active=true]:cursor-grabbing"
      data-active={activeHandle === handle}
      style={{ left: `${percent}%` }}
      onPointerDown={startGrabbing(handle)}
      onKeyDown={handleKeyboardInput(handle)}
      role="slider"
      aria-label={aria["aria-label"]}
      aria-valuemin={aria["aria-valuemin"]}
      aria-valuemax={aria["aria-valuemax"]}
      aria-valuenow={aria["aria-valuenow"]}
      tabIndex={0}
      {...props}
    />
  );
};

const Range = (props: RangeProps) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeHandle, setActiveHandle] = useState<ActiveHandle>(null);

  const mode: RangeMode = useMemo(() => {
    if ("rangeValues" in props && props.rangeValues) {
      return "fixed";
    }
    return "continuous";
  }, [props]);

  const { min, max, step = 0.1, className, rangeValues } = props;

  const sortedFixedValues = useMemo(() => {
    if (mode === "fixed" && rangeValues) {
      return [...rangeValues].sort((a, b) => a - b);
    }
    return undefined;
  }, [mode, rangeValues]);

  const [inputsText, setInputsText] = useState<{
    min: string;
    max: string;
  }>({ min: String(min), max: String(max) });

  const [continuousMin, continuousMax] = useMemo(() => {
    const safeMin = Math.min(min, max);
    const safeMax = Math.max(min, max);
    return [safeMin, safeMax] as const;
  }, [min, max]);

  const [value, setValue] = useState<[number, number]>(() => {
    if (mode === "fixed" && sortedFixedValues && sortedFixedValues.length > 0) {
      const validValues = sortedFixedValues.filter(
        (v) => v >= continuousMin && v <= continuousMax,
      );

      if (validValues.length === 0) {
        const minFixed = findNearestFixedValue(
          continuousMin,
          sortedFixedValues,
        );
        const maxFixed = findNearestFixedValue(
          continuousMax,
          sortedFixedValues,
        );
        return [minFixed, maxFixed];
      }

      return [validValues[0], validValues[validValues.length - 1]];
    }
    return [continuousMin, continuousMax];
  });

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

        if (mode === "fixed" && sortedFixedValues) {
          if (handle === "min") {
            const candidate = findNearestFixedValue(
              nextValue,
              sortedFixedValues,
              continuousMin,
              currentMax,
            );
            currentMin = candidate;
          } else {
            const candidate = findNearestFixedValue(
              nextValue,
              sortedFixedValues,
              currentMin,
              continuousMax,
            );
            currentMax = candidate;
          }
        } else {
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
        }

        return [currentMin, currentMax];
      });
    },
    [mode, sortedFixedValues, continuousMin, continuousMax, step],
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

      if (mode === "fixed" && sortedFixedValues) {
        updateValue(closeHandle, candidate);
      } else {
        updateValue(closeHandle, candidate);
      }
    },
    [mode, sortedFixedValues, continuousMin, continuousMax, updateValue],
  );

  const updateInputsText = useCallback(
    (handle: Exclude<ActiveHandle, null>) => {
      const newInputsText = {
        min: String(value[0]),
        max: String(value[1]),
      };
      if (newInputsText[handle] === inputsText[handle]) return;
      setInputsText(newInputsText);
    },
    [inputsText, value],
  );

  useEffect(() => {
    if (!activeHandle) return;
    const onPointerMove = (event: PointerEvent) => {
      handlePointerMove(activeHandle, event.clientX);
      updateInputsText(activeHandle);
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
  }, [activeHandle, handlePointerMove, updateInputsText, value]);

  const startGrabbing = useCallback((handle: Exclude<ActiveHandle, null>) => {
    return (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setActiveHandle(handle);
      document.body.style.cursor = "grabbing";
    };
  }, []);

  const handleKeyboardInput = useCallback(
    (handle: Exclude<ActiveHandle, null>) => {
      return (event: KeyboardEvent<HTMLButtonElement>) => {
        const currentValue = handle === "min" ? value[0] : value[1];
        let newValue: number | null = null;

        let direction: 1 | -1 | null = null;
        if (
          event.key === "ArrowRight" ||
          event.key === "ArrowUp" ||
          event.key === "PageUp"
        ) {
          direction = 1;
        } else if (
          event.key === "ArrowLeft" ||
          event.key === "ArrowDown" ||
          event.key === "PageDown"
        ) {
          direction = -1;
        }

        if (direction !== null) {
          if (mode === "fixed" && sortedFixedValues) {
            const minConstraint = handle === "min" ? continuousMin : value[0];
            const maxConstraint = handle === "min" ? value[1] : continuousMax;
            const adjacent = getAdjacentFixedValue(
              currentValue,
              sortedFixedValues,
              direction,
              minConstraint,
              maxConstraint,
            );
            if (adjacent !== null) {
              newValue = adjacent;
            }
          } else {
            const stepSize =
              event.key === "PageUp" || event.key === "PageDown"
                ? step * 10
                : step;
            newValue = currentValue + direction * stepSize;
          }
        }

        if (newValue !== null) {
          event.preventDefault();
          updateValue(handle, newValue);
        }
      };
    },
    [
      value,
      mode,
      sortedFixedValues,
      continuousMin,
      continuousMax,
      step,
      updateValue,
    ],
  );

  const ctx: RangeContextValue = useMemo(
    () => ({
      trackRef,
      value,
      setValue,
      continuousMin,
      continuousMax,
      inputsText,
      setInputsText,
      step,
      mode,
      fixedValues: sortedFixedValues,
      getPercentForValue,
      updateValue,
      startGrabbing,
      handleKeyboardInput,
      activeHandle,
    }),
    [
      value,
      continuousMin,
      continuousMax,
      inputsText,
      step,
      mode,
      sortedFixedValues,
      getPercentForValue,
      updateValue,
      startGrabbing,
      handleKeyboardInput,
      activeHandle,
    ],
  );

  return (
    <RangeContext.Provider value={ctx}>
      <div
        className={twMerge("flex gap-8", className)}
        data-dragging={Boolean(activeHandle)}
      >
        <Input handle="min" label="Minimum value" disabled={mode === "fixed"} />
        <Track />
        <Input handle="max" label="Maximum value" disabled={mode === "fixed"} />
      </div>
    </RangeContext.Provider>
  );
};

export default Range;
