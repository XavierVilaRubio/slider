import * as z from "zod/mini";

export const RangePropsSchema = z.object({
  min: z.number(),
  max: z.number(),
});
