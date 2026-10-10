import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, Wrench } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useRequestsStore } from "../store/useRequestsStore";
import { useWorkStore } from "../store/useWorkStore";
import { findWorker } from "../data/workAdapter";
import { Banner, Btn, Card } from "./Ui";

// Para insertar dentro de WorkerHome: progreso del mes, avisos y reactivación
export default function WorkerSummary() {
  const user = useAppStore((s) => s.currentUser);
  const settings = useWorkStore((s) => s.settings);
  const warned = useWorkStore((s) => s.warned);
  const reactivations = useWorkStore((s) => s.reactivations);
  const joinedAt = useWorkStore((s) => s.joinedAt);
  const monthJobs = useWorkStore((s) => s.monthJobs);
  const ask = useWorkStore((s) => s.requestReactivation);
  useRequestsStore((s) => s.requests); // vuelve a calcular al finalizar trabajos

  const w = findWorker(user?.id);
  if (!w) return null;

  const done = monthJobs(w.id);
  const pct = settings.minMonthly === 0 ? 100 : Math.min(100, Math.round((done / settings.minMonthly) * 100));
  const inGrace = joinedAt[w.id] !== undefined && Date.now() - joinedAt[w.id] < settings.graceDays * 86_400_000;
  const asked = reactivations.includes(w.id);

  return (
    <div className="space-y-4">
      {!w.active && (
        <Banner tone="warn">
          Tu cuenta está inactiva y no apareces en las búsquedas.{" "}
          {asked ? (
            <strong>Tu solicitud de reactivación está en revisión.</strong>
          ) : (
            <span className="mt-2 block">
              <Btn onClick={() => ask(w.id)}>Solicitar reactivación</Btn>
            </span>
          )}
        </Banner>
      )}

      {w.active && warned[w.id] && (
        <Banner tone="warn">
          <AlertTriangle className="mr-1 inline" size={14} /> Aviso: estás por debajo del mínimo mensual ({done} de {settings.minMonthly}). Completa más trabajos para evitar que tu cuenta se inactive.
        </Banner>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg uppercase text-forest-950">Tu mes</h2>
          {inGrace && <span className="rounded-full bg-gold-400/30 px-3 py-1 text-xs font-bold text-forest-900">Período de gracia</span>}
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-forest-900/10">
          <motion.div
            className={`h-full rounded-full ${pct >= 100 ? "bg-forest-700" : "bg-terracotta-500"}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7 }}
          />
        </div>
        <p className="mt-2 text-sm text-forest-900/70">
          {done} de {settings.minMonthly} trabajos completados este mes.
        </p>
        <Link
          to="/trabajador/servicios"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-forest-800 px-5 py-2 text-sm font-bold text-white transition-all duration-200 hover:scale-105 hover:bg-forest-700"
        >
          <Wrench size={16} /> Mis servicios y fotos
        </Link>
      </Card>
    </div>
  );
}
