import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, CalendarCheck, ClipboardList, Clock, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { lastJobText, workers } from "../data/workers";
import { useAppStore } from "../store/useAppStore";
import { useRequestsStore } from "../store/useRequestsStore";

function StatCard({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border-2 border-transparent bg-white p-5 shadow-md shadow-black/10 transition-[border-color,box-shadow] duration-300 hover:border-terracotta-500 hover:shadow-xl"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-forest-900 text-white">
        <Icon size={20} />
      </span>
      <p className="mt-3 font-display text-3xl text-forest-900">{value}</p>
      <p className="text-sm text-forest-900/60">{label}</p>
    </motion.div>
  );
}

function SoonCard({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-forest-900/20 p-6 text-center text-sm text-forest-900/60">
      {text}
    </div>
  );
}

export function WorkerHome() {
  const user = useAppStore((s) => s.currentUser);
  const requests = useRequestsStore((s) => s.requests);
  if (!user) return null;

  const worker = workers.find((w) => w.userId === user.id);
  const mine = worker ? requests.filter((r) => r.workerId === worker.id) : [];
  const pending = mine.filter((r) => r.status === "pendiente").length;
  const accepted = mine.filter((r) => r.status === "aceptada").length;
  const finishedNow = mine.filter((r) => r.status === "finalizada").length;

  // Valor base de ejemplo + los trabajos que se cierran en esta sesión (CU-13 se completa después)
  const done = 2 + finishedNow;
  const min = 5;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl uppercase text-forest-900">Hola, {user.name.split(" ")[0]}</h1>
        <p className="text-forest-900/60">Panel del trabajador</p>
      </motion.div>

      {!user.accountActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-3 rounded-2xl bg-terracotta-500/10 p-4 text-terracotta-600"
        >
          <AlertTriangle className="mt-0.5 shrink-0" size={20} />
          <p className="text-sm font-medium">
            Tu cuenta está inactiva y tu perfil está oculto para los clientes. Podrás solicitar la reactivación
            cuando se implemente la evaluación mensual.
          </p>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }}>
        <Link
          to="/trabajador/solicitudes"
          className="group flex items-center justify-between gap-4 rounded-2xl bg-forest-900 p-5 text-white shadow-lg shadow-forest-900/25 transition-colors duration-300 hover:bg-forest-800"
        >
          <div>
            <p className="font-display text-xl uppercase tracking-wide">Solicitudes recibidas</p>
            <p className="text-sm text-white/70">
              {pending > 0
                ? `Tienes ${pending} ${pending === 1 ? "solicitud pendiente" : "solicitudes pendientes"} por responder`
                : "No tienes solicitudes pendientes"}
            </p>
          </div>
          <span className="flex items-center gap-3">
            {pending > 0 && (
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="grid h-9 min-w-9 place-items-center rounded-full bg-terracotta-500 px-2 text-sm font-bold"
              >
                {pending}
              </motion.span>
            )}
            <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={ClipboardList} label="Solicitudes pendientes" value={pending} delay={0.05} />
        <StatCard icon={CalendarCheck} label="Servicios por realizar" value={accepted} delay={0.1} />
        <StatCard icon={Clock} label="Último trabajo" value={worker ? lastJobText(worker.lastJobDaysAgo) : "—"} delay={0.15} />
        <StatCard icon={ShieldCheck} label="Estado de la cuenta" value={user.accountActive ? "Activa" : "Inactiva"} delay={0.2} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl bg-white p-5 shadow-md shadow-black/10"
      >
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-forest-900">
          <span>Mínimo mensual de trabajos</span>
          <span>
            {done} / {min}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-forest-900/10">
          <motion.div
            key={done}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(1, done / min) * 100}%` }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-forest-700 to-gold-400"
          />
        </div>
      </motion.div>

      <SoonCard text="Próximamente: perfil de servicios y fotos de trabajos (CU-05)." />
    </main>
  );
}

export function AdminHome() {
  const users = useAppStore((s) => s.users);
  const pending = users.filter((u) => u.workerStatus === "en_revision").length;
  const verified = users.filter((u) => u.workerStatus === "verificado").length;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl uppercase text-forest-900">Panel del administrador</h1>
        <p className="text-forest-900/60">Verificación de trabajadores y parámetros</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={ClipboardList} label="Postulaciones en revisión" value={pending} delay={0.05} />
        <StatCard icon={ShieldCheck} label="Trabajadores verificados" value={verified} delay={0.1} />
        <StatCard icon={Users} label="Usuarios registrados" value={users.length} delay={0.15} />
      </div>

      <SoonCard text="Próximamente: bandeja de postulaciones (CU-04) y configuración de parámetros (CU-14)." />
    </main>
  );
}