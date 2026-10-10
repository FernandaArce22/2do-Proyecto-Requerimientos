import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import HowItWorksModal from "./HowItWorksModal";

export default function FeaturedBanner() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 p-6 text-white shadow-xl shadow-black/20 sm:p-8"
      >
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
            <ShieldCheck size={14} /> Proveedores verificados
          </span>
          <h2 className="font-display text-3xl uppercase leading-tight tracking-wide sm:text-4xl">
            Contrata con seguridad, sin sorpresas
          </h2>
          <p className="text-sm text-white/80 sm:text-base">
            Ubicación en el mapa, anticipo protegido y seguimiento en tiempo real.
          </p>
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex items-center gap-2 rounded-xl bg-terracotta-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-terracotta-500/30 transition-colors duration-200 hover:bg-terracotta-600"
          >
            Cómo funciona
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </motion.button>
        </div>

        <motion.div
          aria-hidden
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-6 top-1/2 hidden h-40 w-40 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-500 text-forest-900 shadow-2xl shadow-black/30 sm:grid"
        >
          <ShieldCheck size={72} strokeWidth={1.6} />
        </motion.div>
        <div aria-hidden className="absolute -bottom-16 right-0 h-48 w-48 rounded-full bg-white/5" />
      </motion.section>

      <HowItWorksModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}