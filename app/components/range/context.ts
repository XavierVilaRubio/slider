import {
  createContext,
  useContext,
  type Dispatch,
  type KeyboardEvent,
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
  inputsText: {
    min: string;
    max: string;
  };
  setInputsText: Dispatch<SetStateAction<{ min: string; max: string }>>;
  step: number;
  mode: RangeMode;
  fixedValues?: number[];
  getPercentForValue: (input: number) => number;
  updateValue: (handle: Exclude<ActiveHandle, null>, nextValue: number) => void;
  startGrabbing: (
    handle: Exclude<ActiveHandle, null>,
  ) => (event: ReactPointerEvent<HTMLButtonElement>) => void;
  handleKeyboardInput: (
    handle: Exclude<ActiveHandle, null>,
  ) => (event: KeyboardEvent<HTMLButtonElement>) => void;
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
