import { useRangeContext } from "@/app/components/range/context/context";
import { getPercentForValue } from "../utils/utils";

type IndicatorProps = React.ComponentProps<"div">;
const Indicator = (props: IndicatorProps) => {
  const { value, continuousMin, continuousMax } = useRangeContext();

  const minPercent = getPercentForValue(value[0], continuousMin, continuousMax);
  const maxPercent = getPercentForValue(value[1], continuousMin, continuousMax);

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

export default Indicator;
