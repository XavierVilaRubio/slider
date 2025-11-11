import * as z from "zod/mini";

export const ContinuousRangePropsSchema = z.object({
  min: z.number(),
  max: z.number(),
  mode: z.optional(z.literal("continuous")),
});

export const FixedValuesRangePropsSchema = z.object({
  rangeValues: z.array(z.number()).check(z.minLength(1)),
  min: z.number(),
  max: z.number(),
  mode: z.optional(z.literal("fixed")),
});

export const RangePropsSchema = z.union([
  ContinuousRangePropsSchema,
  FixedValuesRangePropsSchema,
]);

export type ContinuousRangeProps = z.infer<
  typeof ContinuousRangePropsSchema
> & {
  step?: number;
  className?: string;
  rangeValues?: never;
};

export type FixedValuesRangeProps = z.infer<
  typeof FixedValuesRangePropsSchema
> & {
  className?: string;
  step?: never;
};

export type RangeProps = ContinuousRangeProps | FixedValuesRangeProps;
