const palettes = [
  "from-emerald-300 to-emerald-500",
  "from-sky-300 to-sky-500",
  "from-amber-300 to-amber-500",
  "from-rose-300 to-rose-500",
  "from-teal-300 to-teal-500",
  "from-violet-300 to-violet-500",
];

type Props = { name: string; size?: "md" | "lg"; className?: string };

export default function Avatar({ name, size = "md", className = "" }: Props) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const palette = palettes[name.charCodeAt(0) % palettes.length];
  const dim = size === "lg" ? "h-24 w-24 text-3xl" : "h-16 w-16 text-xl";

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-display text-forest-900 ring-4 ring-white ${palette} ${dim} ${className}`}
    >
      {initials}
    </span>
  );
}