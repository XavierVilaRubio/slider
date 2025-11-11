import { Range } from "@/app/components/range/Range";
import { RangePropsSchema } from "../components/range/schema";

export default async function Exercise1Page() {
  const res = await fetch("http://localhost:8080/api/exercise1", {
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) return "Failed to load continuous range configuration";

  const parsedData = RangePropsSchema.safeParse(data);
  if (!parsedData.success)
    return "Invalid response shape for continuous range configuration";

  const range = parsedData.data;

  return (
    <main className="w-full space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Selectable Range</h2>
      <Range min={range.min} max={range.max} />
    </main>
  );
}
