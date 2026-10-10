import { useEffect } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X } from "lucide-react";

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger" | "gold";
  disabled?: boolean;
  type?: "button" | "submit";
  full?: boolean;
};

const variants: Record<NonNullable<BtnProps["variant"]>, string> = {
  primary: "bg-terracotta-500 text-white hover:bg-terracotta-600 hover:shadow-lg hover:shadow-terracotta-500/30",
  gold: "bg-gold-400 text-forest-950 hover:bg-gold-500 hover:shadow-lg hover:shadow-gold-400/40",
  ghost: "border-2 border-forest-900/20 bg-white text-forest-900 hover:border-forest-700 hover:bg-forest-900/5",
  danger: "border-2 border-terracotta-500 bg-white text-terracotta-600 hover:bg-terracotta-500 hover:text-white",
};

export function Btn({ children, onClick, variant = "primary", disabled, type = "button", full }: BtnProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.04, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
        full ? "w-full" : ""
      } ${variants[variant]}`}
    >
      {children}
    </motion.button>
  );
}

type DialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
};

export function Dialog({ open, title, onClose, children, footer, wide }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center bg-forest-950/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className={`flex max-h-[90vh] w-full flex-col rounded-3xl bg-white shadow-2xl ${wide ? "max-w-2xl" : "max-w-md"}`}
          >
            <div className="flex items-center justify-between border-b border-forest-900/10 px-6 py-4">
              <h2 className="font-display text-xl uppercase tracking-wide text-forest-950">{title}</h2>
              <motion.button
                type="button"
                aria-label="Cerrar"
                onClick={onClose}
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.85 }}
                className="grid h-8 w-8 place-items-center rounded-full text-forest-900 transition-colors hover:bg-terracotta-500 hover:text-white"
              >
                <X size={18} />
              </motion.button>
            </div>
            <div className="overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-forest-900/10 px-6 py-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Mensaje dentro de la página (reemplaza a los avisos flotantes en las pantallas nuevas)
export function Banner({ children, tone = "ok" }: { children: ReactNode; tone?: "ok" | "info" | "warn" }) {
  const cls =
    tone === "ok"
      ? "bg-forest-700/10 text-forest-900"
      : tone === "warn"
        ? "bg-terracotta-500/10 text-terracotta-600"
        : "bg-gold-400/25 text-forest-900";
  const Icon = tone === "ok" ? CheckCircle2 : Info;
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-sm font-medium ${cls}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </motion.div>
  );
}

export const when = (t: number) =>
  new Date(t).toLocaleString("es-CR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export const Card = ({ children }: { children: ReactNode }) => (
  <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-forest-900/5 transition-shadow duration-300 hover:shadow-lg">
    {children}
  </div>
);

export const PageTitle = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="mb-6">
    <h1 className="font-display text-3xl uppercase tracking-wide text-forest-950 sm:text-4xl">{title}</h1>
    {sub && <p className="mt-1 text-forest-900/70">{sub}</p>}
  </div>
);
