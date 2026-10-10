import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Briefcase, ClipboardList, Settings, UserCheck, Wrench } from "lucide-react";
import type { ComponentType } from "react";
import { useAppStore } from "../store/useAppStore";

type Item = { to: string; label: string; icon: ComponentType<{ size?: number }> };

// Barra de accesos rápidos según el rol activo. Se coloca justo debajo del Header.
export default function QuickNav() {
  const user = useAppStore((s) => s.currentUser);
  const role = useAppStore((s) => s.activeRole);
  if (!user) return null;

  let items: Item[] = [];
  if (role === "cliente") {
    if (user.workerStatus !== "verificado") items = [{ to: "/postularme", label: "Quiero ofrecer servicios", icon: Briefcase }];
  } else if (role === "trabajador") {
    items = [
      { to: "/trabajador/solicitudes", label: "Solicitudes recibidas", icon: ClipboardList },
      { to: "/trabajador/servicios", label: "Mis servicios", icon: Wrench },
    ];
  } else if (role === "administrador") {
    items = [
      { to: "/admin/postulaciones", label: "Postulaciones", icon: UserCheck },
      { to: "/admin/actividad", label: "Actividad mensual", icon: Activity },
      { to: "/admin/configuracion", label: "Configuración", icon: Settings },
    ];
  }
  if (items.length === 0) return null;

  return (
    <nav aria-label="Accesos rápidos" className="border-b border-forest-900/10 bg-cream-50">
      <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-2">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} className="shrink-0">
            {({ isActive }) => (
              <motion.span
                whileHover={{ y: -2, scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200 ${
                  isActive ? "bg-forest-800 text-white" : "text-forest-900 hover:bg-terracotta-500/10 hover:text-terracotta-600"
                }`}
              >
                <it.icon size={16} /> {it.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
