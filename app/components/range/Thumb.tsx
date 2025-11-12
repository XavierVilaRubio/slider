import { type ActiveHandle, useRangeContext } from "@/components/range/context";

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
      className="absolute top-1/2 size-5 -translate-1/2 cursor-grab touch-none rounded-full border-2 border-white bg-blue-500 shadow transition-[transform,shadow] hover:scale-110 focus:scale-110 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none data-[active=true]:scale-110 data-[active=true]:cursor-grabbing"
      data-active={activeHandle === handle}
      style={{ left: `${percent}%`, touchAction: "none" }}
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

export default Thumb;
