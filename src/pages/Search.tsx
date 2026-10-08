import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Search as SearchIcon, SearchX, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import WorkerCard from "../components/WorkerCard";
import { categories } from "../data/mockData";
import { colones, fromRate, searchText, visibleWorkers, zones } from "../data/workers";
import { matchesQuery } from "../utils/search";

const PAGE_SIZE = 4;

const rateOptions = [0, 15000, 30000, 60000];
const ratingOptions = [0, 4, 4.5, 4.8];

const chips = [{ id: "todos", name: "Todos" }, ...categories.map((c) => ({ id: c.id, name: c.name }))];

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-forest-900/60">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer rounded-xl border-2 border-forest-900/15 bg-white px-3 py-2.5 text-sm font-semibold text-forest-900 outline-none transition-all duration-200 hover:border-forest-900/40 focus:border-terracotta-500 focus:shadow-md focus:shadow-terracotta-500/15"
      >
        {children}
      </select>
    </label>
  );
}

function SkeletonRow() {
  return (
    <div className="flex gap-4 rounded-2xl bg-white p-4 shadow-md shadow-black/10">
      <div className="h-16 w-16 animate-pulse rounded-full bg-forest-900/10" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-1/2 animate-pulse rounded bg-forest-900/10" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-forest-900/10" />
        <div className="h-6 w-1/4 animate-pulse rounded bg-forest-900/10" />
      </div>
    </div>
  );
}

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const cat = params.get("categoria") ?? "todos";

  const [zone, setZone] = useState("todas");
  const [maxRate, setMaxRate] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<"rating" | "tarifa">("rating");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [q, cat, zone, maxRate, minRating, sort]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== "todos") next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const list = visibleWorkers.filter(
      (w) =>
        (cat === "todos" || w.services.some((s) => s.categoryId === cat)) &&
        (zone === "todas" || w.zone === zone) &&
        w.rating >= minRating &&
        (maxRate === 0 || fromRate(w, cat) <= maxRate) &&
        matchesQuery(searchText(w), q),
    );
    return list.sort((a, b) => (sort === "rating" ? b.rating - a.rating : fromRate(a, cat) - fromRate(b, cat)));
  }, [q, cat, zone, maxRate, minRating, sort]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const slice = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const hasFilters = zone !== "todas" || maxRate > 0 || minRating > 0 || cat !== "todos" || q !== "";
  const clearAll = () => {
    setZone("todas");
    setMaxRate(0);
    setMinRating(0);
    setParams(new URLSearchParams(), { replace: true });
  };

  return (
    <>
      <section className="relative overflow-hidden rounded-b-[2rem] bg-forest-900 pb-6 text-white">
        <motion.div
          aria-hidden
          initial={{ scale: 1.03 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: "url('/img/hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/90 via-forest-900/60 to-forest-900/30" />

        <div className="relative mx-auto max-w-5xl space-y-4 px-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
            Inicio
          </Link>
          <h1 className="font-display text-3xl uppercase tracking-wide sm:text-4xl">Encuentra a tu trabajador</h1>

          <div className="group relative">
            <SearchIcon
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest-900/50 transition-colors group-focus-within:text-terracotta-500"
            />
            <input
              type="text"
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
              placeholder='Describe lo que necesitas: "fuga de agua", "podar un árbol"…'
              aria-label="Buscar trabajadores y servicios"
              className="w-full rounded-2xl border-2 border-transparent bg-white py-3.5 pl-12 pr-11 text-forest-950 shadow-md shadow-black/10 outline-none transition-all duration-200 placeholder:text-forest-900/40 hover:shadow-lg focus:border-terracotta-500 focus:shadow-xl focus:shadow-terracotta-500/20"
            />
            <AnimatePresence>
              {q && (
                <motion.button
                  type="button"
                  aria-label="Borrar búsqueda"
                  onClick={() => setParam("q", "")}
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

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none]">
            {chips.map((chip) => {
              const active = cat === chip.id;
              return (
                <motion.button
                  key={chip.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setParam("categoria", chip.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                    active ? "text-forest-900" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="search-chip"
                      className="absolute inset-0 rounded-full bg-white"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{chip.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl space-y-5 px-4 pb-16 pt-6">
        {/* Filtros */}
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-md shadow-black/10 md:grid-cols-4">
          <Select label="Zona" value={zone} onChange={setZone}>
            <option value="todas">Todas las zonas</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </Select>
          <Select label="Tarifa" value={String(maxRate)} onChange={(v) => setMaxRate(Number(v))}>
            {rateOptions.map((r) => (
              <option key={r} value={r}>
                {r === 0 ? "Cualquier tarifa" : `Hasta ${colones(r)}`}
              </option>
            ))}
          </Select>
          <Select label="Calificación" value={String(minRating)} onChange={(v) => setMinRating(Number(v))}>
            {ratingOptions.map((r) => (
              <option key={r} value={r}>
                {r === 0 ? "Cualquiera" : `${r} o más`}
              </option>
            ))}
          </Select>
          <Select label="Ordenar por" value={sort} onChange={(v) => setSort(v as "rating" | "tarifa")}>
            <option value="rating">Mejor calificados</option>
            <option value="tarifa">Menor tarifa</option>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-forest-900/70" aria-live="polite">
            {loading ? "Buscando…" : `${results.length} ${results.length === 1 ? "trabajador" : "trabajadores"}`}
          </p>
          {hasFilters && !loading && (
            <button
              type="button"
              onClick={clearAll}
              className="text-sm font-semibold text-forest-700 underline-offset-4 transition-colors hover:text-terracotta-500 hover:underline"
            >
              Quitar filtros
            </button>
          )}
        </div>

        {/* Resultados */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <motion.div layout className="space-y-4">
              <AnimatePresence mode="popLayout">
                {slice.map((w, i) => (
                  <WorkerCard key={w.id} worker={w} index={i} category={cat} />
                ))}
              </AnimatePresence>
            </motion.div>

            {totalPages > 1 && (
              <nav aria-label="Paginación" className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  aria-label="Página anterior"
                  disabled={current === 1}
                  onClick={() => setPage(current - 1)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-forest-900 shadow transition-all hover:bg-forest-900 hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-forest-900"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    aria-current={current === i + 1 ? "page" : undefined}
                    onClick={() => setPage(i + 1)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`h-10 w-10 rounded-full text-sm font-bold shadow transition-colors ${
                      current === i + 1
                        ? "bg-terracotta-500 text-white"
                        : "bg-white text-forest-900 hover:bg-forest-900 hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
                <button
                  type="button"
                  aria-label="Página siguiente"
                  disabled={current === totalPages}
                  onClick={() => setPage(current + 1)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-forest-900 shadow transition-all hover:bg-forest-900 hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-forest-900"
                >
                  <ChevronRight size={18} />
                </button>
              </nav>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-14 text-center shadow-md shadow-black/5"
          >
            <SearchX size={40} className="text-terracotta-500" />
            <p className="font-semibold text-forest-900">No encontramos trabajadores con esos criterios</p>
            <p className="text-sm text-forest-900/60">Prueba ampliando la zona o quitando algún filtro.</p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {zone !== "todas" && (
                <button
                  type="button"
                  onClick={() => setZone("todas")}
                  className="rounded-full bg-forest-900/5 px-4 py-2 text-sm font-semibold text-forest-900 transition-colors hover:bg-forest-900 hover:text-white"
                >
                  Ampliar zona
                </button>
              )}
              <button
                type="button"
                onClick={clearAll}
                className="rounded-full bg-terracotta-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-terracotta-600"
              >
                Quitar todos los filtros
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </>
  );
}