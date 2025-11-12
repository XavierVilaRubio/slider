import { useRangeContext } from "@/components/range/context";
import { formatCurrency } from "@/components/range/utils";

type FixedValueLabelsProps = {
  values: number[];
};
const FixedValueLabels = ({ values }: FixedValueLabelsProps) => {
  const { getPercentForValue } = useRangeContext();

  return (
    <div className="relative mt-2">
      {values.map((value, index) => {
        const percent = getPercentForValue(value);
        return (
          <div
            key={index}
            className="absolute -translate-x-1/2 text-xs text-slate-600"
            style={{ left: `${percent}%` }}
          >
            {formatCurrency(value)}
          </div>
        );
      })}
    </div>
  );
};

export default FixedValueLabels;
