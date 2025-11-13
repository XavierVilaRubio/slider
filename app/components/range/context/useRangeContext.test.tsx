import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRangeContext } from "@/app/components/range/context/useRangeContext";

describe("useRangeContext", () => {
  it("initialises continuous mode with sorted bounds", () => {
    const { result } = renderHook(() =>
      useRangeContext({ min: 10, max: 0, step: 0.5 }),
    );

    expect(result.current.mode).toBe("continuous");
    expect(result.current.continuousMin).toBe(0);
    expect(result.current.continuousMax).toBe(10);
    expect(result.current.value).toEqual([0, 10]);
    expect(result.current.inputsText).toEqual({ min: "10", max: "0" });
  });

  it("snaps updates to step for continuous mode", () => {
    const { result } = renderHook(() =>
      useRangeContext({ min: 0, max: 10, step: 0.5 }),
    );

    act(() => {
      result.current.updateValue("min", 3.26);
    });

    expect(result.current.value).toEqual([3.5, 10]);

    act(() => {
      result.current.updateValue("max", 8.74);
    });

    expect(result.current.value).toEqual([3.5, 8.5]);
  });

  it("responds to keyboard events for continuous mode", () => {
    const { result } = renderHook(() =>
      useRangeContext({ min: 0, max: 10, step: 1 }),
    );

    const preventDefault = vi.fn();

    act(() => {
      result.current.handleKeyboardInput("min")({
        key: "ArrowRight",
        preventDefault,
      } as unknown as React.KeyboardEvent<HTMLButtonElement>);
    });

    expect(result.current.value[0]).toBe(1);
    expect(preventDefault).toHaveBeenCalled();

    act(() => {
      result.current.handleKeyboardInput("max")({
        key: "PageDown",
        preventDefault,
      } as unknown as React.KeyboardEvent<HTMLButtonElement>);
    });

    expect(result.current.value[1]).toBe(1);
  });

  it("initialises fixed mode values inside constraints", () => {
    const { result } = renderHook(() =>
      useRangeContext({
        min: 5,
        max: 45,
        rangeValues: [0, 10, 20, 30, 50],
      }),
    );

    expect(result.current.mode).toBe("fixed");
    expect(result.current.value).toEqual([10, 30]);
    expect(result.current.fixedValues).toEqual([0, 10, 20, 30, 50]);
  });

  it("finds nearest fixed values when no values fall within min/max", () => {
    const { result } = renderHook(() =>
      useRangeContext({
        min: 25,
        max: 35,
        rangeValues: [0, 10, 20, 40, 50],
      }),
    );

    expect(result.current.value).toEqual([20, 40]);
  });

  it("uses getAdjacentFixedValue for keyboard movement in fixed mode", () => {
    const { result } = renderHook(() =>
      useRangeContext({
        min: 0,
        max: 100,
        rangeValues: [10, 20, 30, 40],
      }),
    );

    act(() => {
      result.current.handleKeyboardInput("min")({
        key: "ArrowRight",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLButtonElement>);
    });
    expect(result.current.value[0]).toBe(20);

    act(() => {
      result.current.handleKeyboardInput("max")({
        key: "ArrowLeft",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLButtonElement>);
    });
    expect(result.current.value[1]).toBe(30);
  });

  it("updates value when pointer move occurs while grabbing", () => {
    const { result } = renderHook(() =>
      useRangeContext({ min: 0, max: 100, step: 1 }),
    );

    const track = document.createElement("div");
    track.getBoundingClientRect = vi.fn(() => ({
      width: 200,
      height: 10,
      top: 0,
      left: 0,
      bottom: 10,
      right: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }));

    act(() => {
      result.current.trackRef.current = track;
    });

    const pointerEventInit = { clientX: 100 } satisfies PointerEventInit;

    act(() => {
      result.current.startGrabbing("max")({
        preventDefault: vi.fn(),
      } as unknown as React.PointerEvent<HTMLButtonElement>);
    });

    act(() => {
      window.dispatchEvent(new PointerEvent("pointermove", pointerEventInit));
    });

    expect(result.current.value[1]).toBe(50);

    act(() => {
      window.dispatchEvent(new PointerEvent("pointerup"));
    });

    expect(result.current.activeHandle).toBeNull();
  });
});
