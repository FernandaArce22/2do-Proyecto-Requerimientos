import { Star } from "lucide-react";

type Props = { rating: number; size?: number; className?: string };

export default function Stars({ rating, size = 15, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`Calificación ${rating} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          style={{ transitionDelay: `${i * 40}ms` }}
          className={`transition-transform duration-300 group-hover:scale-125 ${
            i < Math.round(rating) ? "fill-gold-400 text-gold-400" : "text-forest-900/20"
          }`}
        />
      ))}
    </span>
  );
}