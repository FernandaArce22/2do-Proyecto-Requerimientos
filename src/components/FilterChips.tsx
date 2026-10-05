import { motion } from "framer-motion";
import { categories } from "../data/mockData";
import { useAppStore } from "../store/useAppStore";

const chips = [{ id: "todos", name: "Todos" }, ...categories.map((c) => ({ id: c.id, name: c.name }))];

export default function FilterChips() {
  const category = useAppStore((s) => s.category);
  const setCategory = useAppStore((s) => s.setCategory);

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none]">
      {chips.map((chip) => {
        const active = category === chip.id;
        return (
          <motion.button
            key={chip.id}
            type="button"
            aria-pressed={active}
            onClick={() => setCategory(chip.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
              active ? "text-forest-900" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {active && (
              <motion.span
                layoutId="chip-active" /* la píldora blanca "viaja" entre chips */
                className="absolute inset-0 rounded-full bg-white"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{chip.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}