import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

const styles = {
  success: { icon: CheckCircle2, bar: "bg-forest-700", color: "text-forest-700" },
  error: { icon: XCircle, bar: "bg-terracotta-500", color: "text-terracotta-500" },
  info: { icon: Info, bar: "bg-gold-500", color: "text-gold-500" },
};

export default function Toaster() {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const { icon: Icon, bar, color } = styles[t.type];
          return (
            <motion.button
              key={t.id}
              type="button"
              layout
              onClick={() => dismiss(t.id)}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className="pointer-events-auto relative flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-xl bg-white py-3 pl-5 pr-4 text-left text-sm font-medium text-forest-950 shadow-xl shadow-black/20"
            >
              <span className={`absolute inset-y-0 left-0 w-1.5 ${bar}`} />
              <Icon size={20} className={`shrink-0 ${color}`} />
              <span>{t.message}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}