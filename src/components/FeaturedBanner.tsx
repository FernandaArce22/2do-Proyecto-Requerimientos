import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Button from "./Button";

export default function FeaturedBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 p-6 text-white shadow-xl shadow-forest-900/20"
    >
      <div className="relative z-10 max-w-[62%] space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
          <ShieldCheck size={14} /> Proveedores verificados
        </span>
        <h2 className="font-display text-2xl uppercase leading-tight sm:text-3xl">
          Contrata con seguridad, sin sorpresas
        </h2>
        <p className="text-sm text-white/80">
          Ubicación en el mapa, anticipo protegido y seguimiento en tiempo real.
        </p>
        <Button>
          Cómo funciona
          <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Insignia dorada que flota suavemente */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-5 top-1/2 grid h-24 w-24 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-500 text-forest-900 shadow-2xl shadow-black/30 sm:h-32 sm:w-32"
      >
        <ShieldCheck size={52} strokeWidth={1.8} />
      </motion.div>

      <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
    </motion.section>
  );
}