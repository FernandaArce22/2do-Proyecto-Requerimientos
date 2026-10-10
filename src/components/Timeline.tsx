import { motion } from "framer-motion";
import { formatDateTime } from "../data/requests";
import type { RequestEvent } from "../data/requests";

export default function Timeline({ events }: { events: RequestEvent[] }) {
  return (
    <ol className="relative space-y-3 border-l-2 border-forest-900/15 pl-5">
      {events.map((e, i) => (
        <motion.li
          key={`${e.at}-${i}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="relative"
        >
          <span
            className={`absolute -left-[1.7rem] top-1 h-3 w-3 rounded-full ring-4 ring-white ${
              i === events.length - 1 ? "bg-terracotta-500" : "bg-forest-700"
            }`}
          />
          <p className="text-sm font-semibold text-forest-900">{e.label}</p>
          <p className="text-xs text-forest-900/50">{formatDateTime(e.at)}</p>
        </motion.li>
      ))}
    </ol>
  );
}