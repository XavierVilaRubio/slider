import { type ActiveHandle, useRangeContext } from "@/components/range/context";
import { clamp, roundToStep } from "@/components/range/utils";
import { useCallback, useRef } from "react";

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

export default Input;
