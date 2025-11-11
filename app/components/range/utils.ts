export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const roundToStep = (value: number, step: number) => {
  if (!step || step <= 0) return value;
  const quotient = Math.round(value / step);
  return Number((quotient * step).toFixed(6));
};
