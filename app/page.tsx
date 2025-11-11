import Link from "next/link";

const links = [
  {
    href: "/exercise1",
    title: "Exercise 1",
  },
  {
    href: "/exercise2",
    title: "Exercise 2",
  },
];

export default function Home() {
  return links.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      className="group w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-lg"
    >
      <h2 className="text-2xl font-semibold text-zinc-900 group-hover:text-blue-600">
        {link.title}
      </h2>
    </Link>
  ));
}
