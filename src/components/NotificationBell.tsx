import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export default function NotificationBell() {
  const count = useAppStore((s) => s.notifications);
  const clear = useAppStore((s) => s.clearNotifications);

  return (
    <motion.button
      type="button"
      onClick={clear}
      aria-label={`Notificaciones: ${count} sin leer`}
      whileHover={{ rotate: [0, -14, 12, -8, 5, 0], transition: { duration: 0.6 } }}
      whileTap={{ scale: 0.88 }}
      className="relative grid h-10 w-10 place-items-center rounded-full text-white transition-colors hover:bg-white/10"
    >
      <Bell size={22} />
      {count > 0 && (
        <motion.span
          key={count} /* al cambiar el número, el globo "salta" */
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 12 }}
          className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-terracotta-500 px-1 text-[11px] font-bold ring-2 ring-forest-900"
        >
          {count}
        </motion.span>
      )}
    </motion.button>
  );
}