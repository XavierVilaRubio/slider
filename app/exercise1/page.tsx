import Range from "@/app/components/range/Range";

export default async function Exercise1Page() {
  const res = await fetch(`https://${process.env.VERCEL_URL}/api/exercise1`, {
    cache: "no-store",
  });
  if (!res.ok) return "Failed to load continuous range configuration";
  const range: {
    min: number;
    max: number;
  } = await res.json();

  return (
    <main className="w-full space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Selectable Range</h2>
      <Range min={range.min} max={range.max} />
    </main>
  );
}
