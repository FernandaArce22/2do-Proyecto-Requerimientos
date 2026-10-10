import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Settings, UserCheck } from "lucide-react";
import { useWorkStore } from "../store/useWorkStore";
import { workers } from "../data/workers";
import { Card } from "./Ui";

// Para insertar dentro de AdminHome: resumen y accesos a las nuevas pantallas
export default function AdminSummary() {
  const apps = useWorkStore((s) => s.applications);
  const reactivations = useWorkStore((s) => s.reactivations);
  useWorkStore((s) => s.lastEvaluation);

  const pending = apps.filter((a) => a.status === "en_revision").length;
  const verified = workers.filter((w) => w.verified).length;

  const tiles = [
    { to: "/admin/postulaciones", icon: UserCheck, title: "Postulaciones", value: pending, note: "pendientes de revisar" },
    { to: "/admin/actividad", icon: Activity, title: "Actividad mensual", value: reactivations.length, note: "reactivaciones solicitadas" },
    { to: "/admin/configuracion", icon: Settings, title: "Configuración", value: verified, note: "trabajadores verificados" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {tiles.map((t) => (
        <Link key={t.to} to={t.to}>
          <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
            <Card>
              <t.icon className="text-terracotta-500" size={26} />
              <p className="mt-3 font-display text-3xl text-forest-950">{t.value}</p>
              <p className="text-sm font-bold text-forest-900">{t.title}</p>
              <p className="text-xs text-forest-900/60">{t.note}</p>
            </Card>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
