import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import type { Category } from "../data/mockData";

type Props = { category: Category; index: number };

export default function CategoryCard({ category, index }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const Icon = category.icon;

  return (
    <motion.div
      layout
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, delay: index * 0.05 } }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer overflow-hidden rounded-2xl border-2 border-transparent bg-white shadow-md shadow-black/10 transition-[border-color,box-shadow] duration-300 hover:border-terracotta-500 hover:shadow-xl hover:shadow-forest-900/25"
    >
      {/* Título */}
      <div className="flex items-center justify-between bg-forest-900 px-3 py-2.5 text-white transition-colors duration-300 group-hover:bg-forest-800">
        <h3 className="font-display text-[15px] uppercase leading-tight tracking-wide">{category.title}</h3>
        <ArrowRight
          size={18}
          className="shrink-0 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
        />
      </div>

      {/* Imagen (o ilustración de respaldo) con zoom al hover */}
      <div className="aspect-[4/3] overflow-hidden">
        {category.image && !imgFailed ? (
          <img
            src={category.image}
            alt={category.title}
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className={`grid h-full w-full place-items-center bg-gradient-to-br ${category.gradient} transition-transform duration-500 group-hover:scale-110`}
          >
            <Icon
              size={52}
              strokeWidth={1.5}
              className="text-forest-900/70 transition-transform duration-500 group-hover:rotate-6"
            />
          </div>
        )}
      </div>

      {/* Datos */}
      <div className="space-y-2 p-3">
        <div className="flex items-center gap-0.5" aria-label={`Calificación ${category.rating} de 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={15}
              style={{ transitionDelay: `${i * 40}ms` }}
              className={`transition-transform duration-300 group-hover:scale-125 ${
                i < Math.round(category.rating) ? "fill-gold-400 text-gold-400" : "text-forest-900/20"
              }`}
            />
          ))}
          <span className="ml-1.5 text-xs font-semibold text-forest-900/70">{category.rating}</span>
        </div>
        <p className="text-xs text-forest-900/60">{category.services} servicios</p>
        <span className="inline-block rounded-md bg-terracotta-500 px-2.5 py-1 text-xs font-bold text-white transition-colors duration-300 group-hover:bg-terracotta-600">
          {category.price}
        </span>
      </div>
    </motion.div>
  );
}