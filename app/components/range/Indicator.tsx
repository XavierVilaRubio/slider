import { useRangeContext } from "@/components/range/context";

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

export default Indicator;
