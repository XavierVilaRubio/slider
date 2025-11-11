import {
  createContext,
  useContext,
  type ChangeEvent,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type SetStateAction,
} from "react";

export type ActiveHandle = "min" | "max" | null;
export type RangeMode = "continuous" | "fixed";

export type RangeContextValue = {
  trackRef: RefObject<HTMLDivElement | null>;
  value: [number, number];
  setValue: Dispatch<SetStateAction<[number, number]>>;
  continuousMin: number;
  continuousMax: number;
  step: number;
  mode: RangeMode;
  fixedValues?: number[];
  getPercentForValue: (input: number) => number;
  updateValue: (handle: Exclude<ActiveHandle, null>, nextValue: number) => void;
  handlePointerDownFactory: (
    handle: Exclude<ActiveHandle, null>,
  ) => (event: ReactPointerEvent<HTMLButtonElement>) => void;
  handleInputChangeFactory: (
    handle: Exclude<ActiveHandle, null>,
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  activeHandle: ActiveHandle;
};

export const RangeContext = createContext<RangeContextValue | null>(null);

export const useRangeContext = () => {
  const ctx = useContext(RangeContext);
  if (!ctx) {
    throw new Error("Range components must be used within <Range.Root>");
  }
  return ctx;
};
