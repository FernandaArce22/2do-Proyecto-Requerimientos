import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { useNotifStore } from "../store/useNotifStore";

const ago = (t: number) => {
  const m = Math.max(1, Math.round((Date.now() - t) / 60_000));
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  return h < 24 ? `hace ${h} h` : `hace ${Math.round(h / 24)} d`;
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.currentUser);
  const items = useNotifStore((s) => s.items);
  const markRead = useNotifStore((s) => s.markRead);
  const markAll = useNotifStore((s) => s.markAll);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;
  const mine = items.filter((n) => n.userId === user.id).sort((a, b) => b.at - a.at);
  const unread = mine.filter((n) => !n.read).length;

  return (
    <div ref={ref} className="relative">
      <motion.button
        type="button"
        aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.1, rotate: [0, -12, 12, -8, 0] }}
        whileTap={{ scale: 0.9 }}
        className="relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-white/10"
      >
        <Bell size={20} />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key={unread}
              initial={{ scale: 0.4, y: 6 }}
              animate={{ scale: 1, y: [0, -6, 0] }}
              exit={{ scale: 0 }}
              className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-terracotta-500 px-1 text-[11px] font-bold text-white"
            >
              {unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white text-forest-950 shadow-2xl ring-1 ring-black/5"
          >
            <div className="flex items-center justify-between border-b border-forest-900/10 px-4 py-3">
              <p className="font-display text-sm uppercase tracking-wide">Notificaciones</p>
              <button
                type="button"
                onClick={() => markAll(user.id)}
                disabled={unread === 0}
                className="flex items-center gap-1 text-xs font-bold text-terracotta-600 transition-opacity hover:underline disabled:opacity-40"
              >
                <CheckCheck size={14} /> Marcar todas
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {mine.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-forest-900/60">No tienes notificaciones.</p>
              ) : (
                mine.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      markRead(n.id);
                      setOpen(false);
                      if (n.to) navigate(n.to);
                    }}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-cream-100 ${
                      n.read ? "" : "bg-gold-400/10"
                    }`}
                  >
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-terracotta-500"}`} />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-forest-950">{n.title}</span>
                      <span className="block text-xs text-forest-900/70">{n.text}</span>
                      <span className="mt-0.5 block text-[11px] text-forest-900/50">{ago(n.at)}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}