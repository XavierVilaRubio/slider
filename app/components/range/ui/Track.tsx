import { useRangeContext } from "@/components/range/context";
import FixedValueLabels from "@/components/range/ui/FixedValueLabels";
import Indicator from "@/components/range/ui/Indicator";
import Thumb from "@/components/range/ui/Thumb";

type RangeTrackProps = React.ComponentProps<"div">;
const Track = (props: RangeTrackProps) => {
  const { trackRef, mode, fixedValues } = useRangeContext();

  return (
    <div className="relative mx-2.5 my-auto flex-1">
      <div
        className="track relative h-2 w-full touch-none rounded-full bg-linear-to-r from-slate-200/90 to-blue-200/90"
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

export default Track;
