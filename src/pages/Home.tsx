import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SearchX } from "lucide-react";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import FeaturedBanner from "../components/FeaturedBanner";
import CategoryCard from "../components/CategoryCard";
import { categories } from "../data/mockData";
import { useAppStore } from "../store/useAppStore";

// Quita tildes y pasa a minúsculas para que "plomeria" encuentre "Plomería"
const normalize = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md shadow-black/10">
      <div className="h-10 animate-pulse bg-forest-900/20" />
      <div className="aspect-[4/3] animate-pulse bg-forest-900/10" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-2/3 animate-pulse rounded bg-forest-900/10" />
        <div className="h-6 w-1/2 animate-pulse rounded bg-forest-900/10" />
      </div>
    </div>
  );
}

export default function Home() {
  const query = useAppStore((s) => s.query);
  const category = useAppStore((s) => s.category);
  const [loading, setLoading] = useState(true);

  // Simula la carga de datos para mostrar los "skeletons"
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(
    () =>
      categories.filter(
        (c) =>
          (category === "todos" || c.id === category) &&
          normalize(`${c.name} ${c.title}`).includes(normalize(query)),
      ),
    [query, category],
  );

  return (
    <>
            {/* Bloque verde (hero) */}
      <section className="relative overflow-hidden rounded-b-[2rem] bg-forest-900 pb-6 text-white">
        {/* Foto de fondo: nítida, con zoom muy lento */}
        <motion.div
          aria-hidden
          initial={{ scale: 1.03 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: "url('/img/hero.jpg')" }}
        />
        {/* Oscurece a la izquierda (texto legible) y deja ver la foto a la derecha */}
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/90 via-forest-900/55 to-forest-900/10" />
        {/* Fusión suave con el header y con el borde inferior */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-900/70 via-transparent to-forest-900/50" />

        <div className="relative mx-auto max-w-5xl space-y-4 px-4">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2 font-display text-3xl uppercase tracking-wide sm:text-4xl"
          >
            Explora servicios del hogar
          </motion.h1>
          <SearchBar />
          <FilterChips />
        </div>
      </section>

      <main className="mx-auto max-w-5xl space-y-8 px-4 pb-16 pt-6">
        <FeaturedBanner />

        <section>
          <h2 className="mb-4 font-display text-xl uppercase tracking-wide text-forest-900">Categorías</h2>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <motion.div layout className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((c, i) => (
                  <CategoryCard key={c.id} category={c} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 rounded-2xl bg-white py-14 text-center shadow-md shadow-black/5"
            >
              <SearchX size={40} className="text-terracotta-500" />
              <p className="font-semibold text-forest-900">No encontramos ese servicio</p>
              <p className="text-sm text-forest-900/60">Prueba con otra palabra o elige otra categoría.</p>
            </motion.div>
          )}
        </section>
      </main>
    </>
  );
}