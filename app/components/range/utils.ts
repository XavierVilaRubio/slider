export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const roundToStep = (value: number, step: number) => {
  if (!step || step <= 0) return value;
  const quotient = Math.round(value / step);
  return Number((quotient * step).toFixed(6));
};

const findNearestInArray = (value: number, arr: number[]): number => {
  if (arr.length === 0) return value;
  if (arr.length === 1) return arr[0];

  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] < value) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  if (left === 0) return arr[0];
  if (left === arr.length) return arr[arr.length - 1];

  const dist1 = Math.abs(value - arr[left - 1]);
  const dist2 = Math.abs(value - arr[left]);

  return dist1 <= dist2 ? arr[left - 1] : arr[left];
};

export const findNearestFixedValue = (
  value: number,
  fixedValues: number[],
  min?: number,
  max?: number,
): number => {
  if (fixedValues.length === 0) return value;

  if (min !== undefined || max !== undefined) {
    const validValues = fixedValues.filter((v) => {
      if (min !== undefined && v < min) return false;
      if (max !== undefined && v > max) return false;
      return true;
    });

    if (validValues.length > 0) {
      return findNearestInArray(value, validValues);
    }

    if (min !== undefined && max !== undefined) {
      const belowMin = fixedValues.filter((v) => v < min);
      const aboveMax = fixedValues.filter((v) => v > max);

      if (belowMin.length > 0 && aboveMax.length > 0) {
        const distToMin = Math.abs(value - belowMin[belowMin.length - 1]);
        const distToMax = Math.abs(value - aboveMax[0]);
        return distToMin <= distToMax
          ? belowMin[belowMin.length - 1]
          : aboveMax[0];
      } else if (belowMin.length > 0) {
        return belowMin[belowMin.length - 1];
      } else if (aboveMax.length > 0) {
        return aboveMax[0];
      }
    } else if (min !== undefined) {
      const belowMin = fixedValues.filter((v) => v < min);
      if (belowMin.length > 0) return belowMin[belowMin.length - 1];
    } else if (max !== undefined) {
      const aboveMax = fixedValues.filter((v) => v > max);
      if (aboveMax.length > 0) return aboveMax[0];
    }

    return findNearestInArray(value, fixedValues);
  }

  return findNearestInArray(value, fixedValues);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
