import { motion } from "framer-motion";
import { Check } from "lucide-react";

type Props = { steps: string[]; current: number };

export default function Stepper({ steps, current }: Props) {
  return (
    <ol className="flex items-start" aria-label="Progreso de la solicitud">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="relative flex flex-1 flex-col items-center gap-1.5 text-center">
            {i > 0 && (
              <span className="absolute right-1/2 top-4 h-1 w-full -translate-y-1/2 overflow-hidden rounded-full bg-forest-900/10">
                <motion.span
                  initial={false}
                  animate={{ width: i <= current ? "100%" : "0%" }}
                  transition={{ duration: 0.5 }}
                  className="block h-full bg-forest-700"
                />
              </span>
            )}
            <motion.span
              initial={false}
              animate={{ scale: active ? 1.12 : 1 }}
              className={`relative z-10 grid h-8 w-8 place-items-center rounded-full text-sm font-bold transition-colors duration-300 ${
                done
                  ? "bg-forest-700 text-white"
                  : active
                    ? "bg-terracotta-500 text-white shadow-lg shadow-terracotta-500/30"
                    : "bg-white text-forest-900/40 ring-2 ring-forest-900/15"
              }`}
            >
              {done ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <Check size={16} />
                </motion.span>
              ) : (
                i + 1
              )}
            </motion.span>
            <span className={`text-xs font-semibold transition-colors ${active ? "text-forest-900" : "text-forest-900/50"}`}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}