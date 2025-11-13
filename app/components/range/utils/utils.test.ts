import {
  clamp,
  findNearestFixedValue,
  formatCurrency,
  getAdjacentFixedValue,
  getPercentForValue,
  roundToStep,
} from "@/app/components/range/utils/utils";

describe("utils", () => {
  describe("clamp", () => {
    it("returns value when within bounds", () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it("returns min when value is below range", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it("returns max when value is above range", () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe("roundToStep", () => {
    it("returns original value when step is falsy", () => {
      expect(roundToStep(3.26, 0)).toBeCloseTo(3.26);
    });

    it("rounds value to nearest step multiple", () => {
      expect(roundToStep(3.26, 0.1)).toBeCloseTo(3.3);
    });

    it("rounds halves away from zero consistently", () => {
      expect(roundToStep(2.25, 0.5)).toBe(2.5);
      expect(roundToStep(-2.25, 0.5)).toBe(-2);
    });
  });

  describe("findNearestFixedValue", () => {
    const fixed = [10, 20, 30, 40, 50];

    it("returns original value when no fixed values", () => {
      expect(findNearestFixedValue(25, [])).toBe(25);
    });

    it("returns nearest value without constraints", () => {
      expect(findNearestFixedValue(27, fixed)).toBe(30);
      expect(findNearestFixedValue(24, fixed)).toBe(20);
    });

    it("respects min and max constraints", () => {
      expect(findNearestFixedValue(15, fixed, 25, 45)).toBe(30);
    });

    it("falls back to closest value even when constraints exclude all", () => {
      expect(findNearestFixedValue(35, fixed, 100, 200)).toBe(50);
      expect(findNearestFixedValue(35, fixed, undefined, 15)).toBe(10);
    });

    it("chooses closest value on both sides when constraints exclude interior", () => {
      expect(findNearestFixedValue(35, fixed, 25, 35)).toBe(30);
      expect(findNearestFixedValue(37, fixed, 0, 32)).toBe(30);
    });
  });

  describe("getAdjacentFixedValue", () => {
    const fixed = [10, 20, 30, 40, 50];

    it("returns null when no fixed values", () => {
      expect(getAdjacentFixedValue(20, [], 1)).toBeNull();
    });

    it("returns next value when handle value exists", () => {
      expect(getAdjacentFixedValue(20, fixed, 1)).toBe(30);
      expect(getAdjacentFixedValue(20, fixed, -1)).toBe(10);
    });

    it("clamps to ends when moving out of bounds", () => {
      expect(getAdjacentFixedValue(50, fixed, 1)).toBe(50);
      expect(getAdjacentFixedValue(10, fixed, -1)).toBe(10);
    });

    it("finds nearest value greater or smaller when current not present", () => {
      expect(getAdjacentFixedValue(25, fixed, 1)).toBe(30);
      expect(getAdjacentFixedValue(25, fixed, -1)).toBe(20);
    });

    it("respects min and max constraints", () => {
      expect(getAdjacentFixedValue(30, fixed, 1, 15, 35)).toBe(30);
      expect(getAdjacentFixedValue(30, fixed, -1, 25, 45)).toBe(30);
      expect(getAdjacentFixedValue(20, fixed, 1, 15, 35)).toBe(30);
      expect(getAdjacentFixedValue(40, fixed, -1, 15, 35)).toBe(30);
    });
  });

  describe("formatCurrency", () => {
    const IntlSpaceCharacter = "\xa0";
    it("formats euro currency in es-ES locale", () => {
      expect(formatCurrency(1234.56)).toBe(`1234,56${IntlSpaceCharacter}€`);
    });

    it("shows two decimal places even for integers", () => {
      expect(formatCurrency(1000)).toBe(`1000,00${IntlSpaceCharacter}€`);
    });
  });

  describe("getPercentForValue", () => {
    it("returns zero when min and max are equal", () => {
      expect(getPercentForValue(10, 10, 10)).toBe(0);
    });

    it("calculates percent within range", () => {
      expect(getPercentForValue(15, 10, 20)).toBe(50);
      expect(getPercentForValue(20, 10, 20)).toBe(100);
    });
  });
});
