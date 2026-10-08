import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ClipboardList, LogIn, LogOut, Repeat, Sprout } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "./Button";
import NotificationBell from "./NotificationBell";
import { APP_NAME } from "../config";
import type { Role } from "../data/users";
import { homeFor } from "../routes";
import { useAppStore } from "../store/useAppStore";

const roleStyle: Record<Role, { label: string; cls: string }> = {
  cliente: { label: "Cliente", cls: "bg-forest-900/10 text-forest-900" },
  trabajador: { label: "Trabajador", cls: "bg-terracotta-500/15 text-terracotta-600" },
  administrador: { label: "Administrador", cls: "bg-gold-400/30 text-forest-900" },
};

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
        danger ? "text-terracotta-600 hover:bg-terracotta-500/10" : "text-forest-900 hover:bg-cream-100"
      }`}
    >
      <span className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-110">
        {icon}
      </span>
      {label}
    </button>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.currentUser);
  const activeRole = useAppStore((s) => s.activeRole);
  const switchRole = useAppStore((s) => s.switchRole);
  const logout = useAppStore((s) => s.logout);
  const showToast = useAppStore((s) => s.showToast);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar el menú al hacer clic fuera o con Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSwitch = (target: Role) => {
    setOpen(false);
    const res = switchRole(target);
    if (!res.ok) {
      showToast("error", res.error);
      return;
    }
    navigate(homeFor(target));
    showToast("success", target === "trabajador" ? "Ahora estás en modo trabajador." : "Ahora estás en modo cliente.");
    if (target === "trabajador" && user && !user.accountActive) {
      showToast("info", "Tu cuenta está inactiva: tu perfil está oculto para los clientes.");
    }
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/");
    showToast("info", "Sesión cerrada.");
  };

  const initials = user
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-30 bg-forest-900 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link to={homeFor(activeRole)} className="flex items-center gap-2.5">
            <motion.span
              whileHover={{ rotate: [0, -12, 12, 0] }}
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-forest-900"
            >
              <Sprout size={22} />
            </motion.span>
            <span className="font-display text-lg uppercase tracking-wide">{APP_NAME}</span>
          </Link>
        </motion.div>

        {!user ? (
          <Button variant="light" onClick={() => navigate("/acceso")}>
            <LogIn size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            Ingresar
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <NotificationBell />

            <div ref={ref} className="relative">
              <motion.button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 rounded-full bg-forest-700 py-1 pl-1 pr-2 ring-2 ring-white/30 transition-all hover:bg-forest-800 hover:ring-gold-400"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-bold text-forest-900">
                  {initials}
                </span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
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
                    className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl bg-white text-forest-950 shadow-2xl ring-1 ring-black/5"
                  >
                    <div className="border-b border-forest-900/10 px-4 py-3">
                      <p className="truncate font-bold">{user.name}</p>
                      <p className="truncate text-xs text-forest-900/60">{user.email}</p>
                      {activeRole && (
                        <span
                          className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${roleStyle[activeRole].cls}`}
                        >
                          Modo {roleStyle[activeRole].label.toLowerCase()}
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      {activeRole === "cliente" && (
                        <MenuItem
                          icon={<ClipboardList size={18} />}
                          label="Mis solicitudes"
                          onClick={() => {
                            setOpen(false);
                            navigate("/solicitudes");
                          }}
                        />
                      )}
                      {activeRole === "cliente" && (
                        <MenuItem
                          icon={<Repeat size={18} />}
                          label="Cambiar a modo trabajador"
                          onClick={() => handleSwitch("trabajador")}
                        />
                      )}
                      {activeRole === "trabajador" && (
                        <MenuItem
                          icon={<Repeat size={18} />}
                          label="Cambiar a modo cliente"
                          onClick={() => handleSwitch("cliente")}
                        />
                      )}
                      <MenuItem icon={<LogOut size={18} />} label="Cerrar sesión" onClick={handleLogout} danger />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}