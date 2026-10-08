import { motion } from "framer-motion";
import { ArrowRight, Clock, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import Stars from "./Stars";
import { categories } from "../data/mockData";
import { colones, fromRate, lastJobText } from "../data/workers";
import type { Worker } from "../data/workers";

type Props = { worker: Worker; index: number; category: string };

export default function WorkerCard({ worker, index, category }: Props) {
  const cats = [...new Set(worker.services.map((s) => s.categoryId))];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.35, delay: index * 0.06 } }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      whileHover={{ y: -4 }}
    >
      <Link
        to={`/trabajadores/${worker.id}`}
        className="group flex gap-4 rounded-2xl border-2 border-transparent bg-white p-4 shadow-md shadow-black/10 transition-[border-color,box-shadow] duration-300 hover:border-terracotta-500 hover:shadow-xl hover:shadow-forest-900/20"
      >
        <div className="transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
          <Avatar name={worker.name} />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="flex items-center gap-1.5 truncate font-display text-lg uppercase tracking-wide text-forest-900">
                {worker.name}
                <ShieldCheck size={17} className="shrink-0 text-gold-500" aria-label="Verificado" />
              </h3>
              <p className="flex items-center gap-1 text-xs text-forest-900/60">
                <MapPin size={13} /> {worker.zone}
              </p>
            </div>
            <ArrowRight
              size={20}
              className="shrink-0 -translate-x-2 text-terracotta-500 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {cats.map((id) => {
              const c = categories.find((x) => x.id === id);
              return (
                <span key={id} className="rounded-full bg-forest-900/5 px-2.5 py-0.5 text-xs font-semibold text-forest-900">
                  {c?.name ?? id}
                </span>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5">
              <Stars rating={worker.rating} />
              <span className="text-xs font-semibold text-forest-900/70">
                {worker.rating} ({worker.reviewCount})
              </span>
            </span>
            <span className="flex items-center gap-1 text-xs text-forest-900/60">
              <Clock size={13} /> Último trabajo {lastJobText(worker.lastJobDaysAgo)}
            </span>
          </div>

          <span className="inline-block rounded-md bg-terracotta-500 px-2.5 py-1 text-xs font-bold text-white transition-colors duration-300 group-hover:bg-terracotta-600">
            Desde {colones(fromRate(worker, category))}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}