import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export default function SearchBar() {
  const query = useAppStore((s) => s.query);
  const setQuery = useAppStore((s) => s.setQuery);

  return (
    <div className="group relative">
      <Search
        size={20}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest-900/50 transition-colors group-focus-within:text-terracotta-500"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Busca un servicio: plomería, jardín…"
        aria-label="Buscar servicios"
        className="w-full rounded-2xl border-2 border-transparent bg-white py-3.5 pl-12 pr-11 text-forest-950 shadow-md shadow-black/10 outline-none transition-all duration-200 placeholder:text-forest-900/40 hover:shadow-lg focus:border-terracotta-500 focus:shadow-xl focus:shadow-terracotta-500/20"
      />
      <AnimatePresence>
        {query && (
          <motion.button
            type="button"
            aria-label="Borrar búsqueda"
            onClick={() => setQuery("")}
            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-forest-900/10 text-forest-900 transition-colors hover:bg-terracotta-500 hover:text-white"
          >
            <X size={16} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}