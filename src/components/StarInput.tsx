import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

type Props = { value: number; onChange: (value: number) => void };

const labels = ["", "Muy mala", "Mala", "Regular", "Buena", "Excelente"];

export default function StarInput({ value, onChange }: Props) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div>
      <div className="flex gap-1" role="radiogroup" aria-label="Calificación" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            onClick={() => onChange(n)}
            whileHover={{ scale: 1.2, rotate: -8 }}
            whileTap={{ scale: 0.85 }}
            className="rounded-full p-1"
          >
            <Star
              size={36}
              className={`transition-colors duration-150 ${n <= shown ? "fill-gold-400 text-gold-400" : "text-forest-900/25"}`}
            />
          </motion.button>
        ))}
      </div>
      <p className="mt-1 h-5 text-sm font-semibold text-forest-900/70">{labels[shown]}</p>
    </div>
  );
}