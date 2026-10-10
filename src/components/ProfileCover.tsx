import { motion } from "framer-motion";
import { Droplets, Hammer, HeartHandshake, Leaf, PaintRoller, Sparkles, Wrench, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Worker } from "../data/workers";
import { coverIdOf, photosOf, servicesOf } from "../data/workAdapter";

const themes: { match: RegExp; icon: LucideIcon; tint: string }[] = [
  { match: /jard|césped|cesped|poda|plant/i, icon: Leaf, tint: "from-emerald-900/70 via-forest-900/80 to-forest-900" },
  { match: /plom|fuga|agua|tuber|grifo/i, icon: Droplets, tint: "from-sky-900/60 via-forest-900/80 to-forest-900" },
  { match: /carpint|madera|closet|puerta|mueble/i, icon: Hammer, tint: "from-amber-900/60 via-forest-900/80 to-forest-900" },
  { match: /electr|luz|cable|tomacorr/i, icon: Zap, tint: "from-yellow-900/50 via-forest-900/80 to-forest-900" },
  { match: /cuid|niñ|nin|adult|mayor/i, icon: HeartHandshake, tint: "from-rose-900/50 via-forest-900/80 to-forest-900" },
  { match: /limpi|aseo/i, icon: Sparkles, tint: "from-teal-900/60 via-forest-900/80 to-forest-900" },
  { match: /pint/i, icon: PaintRoller, tint: "from-orange-900/50 via-forest-900/80 to-forest-900" },
];

// Fondo del encabezado verde del perfil: la foto de portada del trabajador,
// o un patrón con el ícono de su servicio. Ponlo dentro de un contenedor "relative overflow-hidden".
export default function ProfileCover({ worker }: { worker: Worker }) {
  const photos = photosOf(worker);
  const cover = photos.find((p) => p.id === coverIdOf(worker) && p.url) ?? photos.find((p) => p.url);

  if (cover) {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.img
          src={cover.url}
          alt=""
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/70 via-forest-900/75 to-forest-900/95" />
      </div>
    );
  }

  const text = servicesOf(worker).map((s) => `${s.title} ${s.keywords.join(" ")}`).join(" ") + " " + worker.bio;
  const theme = themes.find((t) => t.match.test(text)) ?? { icon: Wrench, tint: "from-forest-800 via-forest-900 to-forest-900" };
  const Icon = theme.icon;

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.tint}`}>
      <div className="absolute inset-0 grid grid-cols-6 gap-10 p-6 opacity-[0.07] sm:grid-cols-10">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (i % 10) * 0.04 }}
            className={i % 2 ? "translate-y-6" : ""}
          >
            <Icon size={36} className="rotate-12 text-white" />
          </motion.span>
        ))}
      </div>
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl" />
    </div>
  );
}