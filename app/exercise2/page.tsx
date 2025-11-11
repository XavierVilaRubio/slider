import Range from "@/app/components/range/Range";

export default async function Exercise2Page() {
  const res = await fetch("http://localhost:8080/api/exercise2", {
    cache: "no-store",
  });
  if (!res.ok) return "Failed to load fixed values range configuration";
  const data: {
    rangeValues: number[];
    min: number;
    max: number;
  } = await res.json();

  return (
    <main className="w-full space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">
        Fixed Values Range
      </h2>
      <Range
        rangeValues={data.rangeValues}
        min={data.min}
        max={data.max}
        mode="fixed"
      />
    </main>
  );
}
