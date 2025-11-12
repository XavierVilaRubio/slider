import { useRangeContext } from "@/app/components/range/context/context";
import {
  formatCurrency,
  getPercentForValue,
} from "@/app/components/range/utils/utils";

type FixedValueLabelsProps = {
  values: number[];
};
const FixedValueLabels = ({ values }: FixedValueLabelsProps) => {
  const { continuousMin, continuousMax } = useRangeContext();

  return (
    <div className="relative mt-2">
      {values.map((value, index) => {
        const percent = getPercentForValue(value, continuousMin, continuousMax);
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
