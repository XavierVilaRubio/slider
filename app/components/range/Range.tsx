"use client";

import type { ChangeEvent, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as z from "zod/mini";
import { RangePropsSchema } from "./schema";

type RangeProps = z.infer<typeof RangePropsSchema>;
type ActiveHandle = "min" | "max" | null;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const roundToStep = (value: number, step: number) => {
  if (!step || step <= 0) return value;
  const quotient = Math.round(value / step);
  return Number((quotient * step).toFixed(6));
};

export function Range(props: RangeProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeHandle, setActiveHandle] = useState<ActiveHandle>(null);
  const step = 0.1;

  const getContinuousBounds = useCallback(() => {
    const min = Math.min(props.min, props.max);
    const max = Math.max(props.min, props.max);
    return [min, max] as const;
  }, [props]);

  const [continuousMin, continuousMax] = getContinuousBounds();

  const resolveInitialValue = useCallback((): [number, number] => {
    return [continuousMin, continuousMax];
  }, [props, continuousMin, continuousMax]);

  const [value, setValue] = useState<[number, number]>(() =>
    resolveInitialValue(),
  );

  const formatValue = useCallback(
    (input: number) =>
      String(Number.isInteger(input) ? input : input.toFixed(2)),
    [],
  );

  const getPercentForValue = useCallback(
    (input: number) => {
      const [min, max] = getContinuousBounds();
      if (max === min) return 0;
      return ((input - min) / (max - min)) * 100;
    },
    [getContinuousBounds],
  );

  const updateValue = useCallback(
    (handle: Exclude<ActiveHandle, null>, nextValue: number) => {
      setValue((current) => {
        let [currentMin, currentMax] = current;

        const [min, max] = getContinuousBounds();
        if (handle === "min") {
          const snapped = roundToStep(clamp(nextValue, min, currentMax), step);
          currentMin = Math.min(snapped, currentMax);
        } else {
          const snapped = roundToStep(clamp(nextValue, currentMin, max), step);
          currentMax = Math.max(snapped, currentMin);
        }

        const next: [number, number] = [currentMin, currentMax];
        return next;
      });
    },
    [props, getContinuousBounds],
  );

  const handlePointerMove = useCallback(
    (closeHandle: Exclude<ActiveHandle, null>, clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      if (!rect.width) return;
      const relative = clamp((clientX - rect.left) / rect.width, 0, 1);

      const [min, max] = getContinuousBounds();
      const candidate = min + relative * (max - min);
      updateValue(closeHandle, candidate);
    },
    [getContinuousBounds, updateValue],
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

  const handlePointerDown = useCallback(
    (handle: Exclude<ActiveHandle, null>) => {
      return (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setActiveHandle(handle);
        document.body.style.cursor = "grabbing";
      };
    },
    [],
  );

  const handleInputChange = useCallback(
    (handle: Exclude<ActiveHandle, null>) => {
      return (event: ChangeEvent<HTMLInputElement>) => {
        const next = Number(event.target.value);
        if (Number.isNaN(next)) return;
        updateValue(handle, next);
      };
    },
    [updateValue],
  );

  const minPercent = getPercentForValue(value[0]);
  const maxPercent = getPercentForValue(value[1]);

  const renderEditableLabel = (
    handle: "min" | "max",
    currentValue: number,
    ariaLabel: string,
  ) => {
    return (
      <label className="flex-1">
        <span className="sr-only">{ariaLabel}</span>
        <input
          type="number"
          className="w-full appearance-none rounded-lg border border-slate-900/10 bg-white px-3 py-2 text-base font-medium text-slate-900 transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
          value={currentValue}
          onChange={handleInputChange(handle)}
          onFocus={(event) => event.target.select()}
          aria-label={ariaLabel}
        />
      </label>
    );
  };

  return (
    <div className="space-y-5" data-dragging={Boolean(activeHandle)}>
      <div className="flex items-center justify-between gap-4">
        {renderEditableLabel("min", value[0], "Minimum value")}
        {renderEditableLabel("max", value[1], "Maximum value")}
      </div>

      <div className="px-1 py-3">
        <div
          className="track relative h-2 rounded-full bg-linear-to-r from-slate-200/90 to-blue-200/90"
          ref={trackRef}
        >
          <div
            className="pointer-events-none absolute top-0 h-full rounded-full bg-linear-to-r from-blue-500 to-blue-600"
            style={{
              left: `${Math.min(minPercent, maxPercent)}%`,
              width: `${Math.abs(maxPercent - minPercent)}%`,
            }}
          />
          <button
            type="button"
            className="absolute top-1/2 size-5 -translate-1/2 cursor-grab rounded-full border-2 border-white bg-blue-500 shadow transition-[transform,shadow] hover:scale-110 data-[active=true]:cursor-grabbing"
            data-active={activeHandle === "min"}
            style={{ left: `${minPercent}%` }}
            onPointerDown={handlePointerDown("min")}
            aria-label="Lower bound"
            aria-valuemin={continuousMin}
            aria-valuemax={value[1]}
            aria-valuenow={value[0]}
            role="slider"
          />
          <button
            type="button"
            className="absolute top-1/2 size-5 -translate-1/2 cursor-grab rounded-full border-2 border-white bg-blue-500 shadow transition-[transform,shadow] hover:scale-110 data-[active=true]:cursor-grabbing"
            data-active={activeHandle === "max"}
            style={{ left: `${maxPercent}%` }}
            onPointerDown={handlePointerDown("max")}
            aria-label="Upper bound"
            aria-valuemin={value[0]}
            aria-valuemax={continuousMax}
            aria-valuenow={value[1]}
            role="slider"
          />
        </div>
      </div>
    </div>
  );
}

export default Range;
