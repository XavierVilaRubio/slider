"use client";

import {
  RangeContext,
  type ActiveHandle,
  type RangeContextValue,
  type RangeMode,
} from "@/components/range/context";
import Input from "@/components/range/Input";
import { type RangeProps } from "@/components/range/schema";
import Track from "@/components/range/Track";
import {
  clamp,
  findNearestFixedValue,
  getAdjacentFixedValue,
  roundToStep,
} from "@/components/range/utils";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

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
        className={twMerge(
          "flex flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:gap-8",
          className,
        )}
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
