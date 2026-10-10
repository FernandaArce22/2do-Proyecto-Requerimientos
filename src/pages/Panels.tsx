import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  Clock,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Btn } from "../components/Ui";
import { lastJobText, workers } from "../data/workers";
import { useAppStore } from "../store/useAppStore";
import { useRequestsStore } from "../store/useRequestsStore";
import { useWorkStore } from "../store/useWorkStore";

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

// Bloque grande que lleva a otra pantalla
function LinkBlock({
  to,
  icon: Icon,
  title,
  text,
  badge,
  delay = 0,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  text: string;
  badge?: number;
  delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} whileHover={{ y: -3 }}>
      <Link
        to={to}
        className="group flex items-center justify-between gap-4 rounded-2xl bg-forest-900 p-5 text-white shadow-lg shadow-forest-900/25 transition-colors duration-300 hover:bg-forest-800"
      >
        <div className="flex items-center gap-4">
          <Icon className="shrink-0 text-gold-400 transition-transform duration-300 group-hover:scale-110" size={28} />
          <div>
            <p className="font-display text-xl uppercase tracking-wide">{title}</p>
            <p className="text-sm text-white/70">{text}</p>
          </div>
        </div>
        <span className="flex items-center gap-3">
          {badge !== undefined && badge > 0 && (
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="grid h-9 min-w-9 place-items-center rounded-full bg-terracotta-500 px-2 text-sm font-bold"
            >
              {badge}
            </motion.span>
          )}
          <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
}

export function WorkerHome() {
  const user = useAppStore((s) => s.currentUser);
  const requests = useRequestsStore((s) => s.requests);
  const settings = useWorkStore((s) => s.settings);
  const warned = useWorkStore((s) => s.warned);
  const reactivations = useWorkStore((s) => s.reactivations);
  const joinedAt = useWorkStore((s) => s.joinedAt);
  const monthJobs = useWorkStore((s) => s.monthJobs);
  const askReactivation = useWorkStore((s) => s.requestReactivation);
  if (!user) return null;

  const worker = workers.find((w) => w.userId === user.id);
  const mine = worker ? requests.filter((r) => r.workerId === worker.id) : [];
  const pending = mine.filter((r) => r.status === "pendiente").length;
  const accepted = mine.filter((r) => r.status === "aceptada").length;

  // CU-13: trabajos del mes (base + los que se cierran en esta sesión) frente al mínimo configurado
  const done = worker ? monthJobs(worker.id) : 0;
  const min = settings.minMonthly;
  const pct = min === 0 ? 100 : Math.min(1, done / min) * 100;
  const inGrace = !!worker && joinedAt[worker.id] !== undefined && Date.now() - joinedAt[worker.id] < settings.graceDays * 86_400_000;
  const asked = !!worker && reactivations.includes(worker.id);
  const warnedNow = !!worker && !!warned[worker.id] && user.accountActive;

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
          <div className="text-sm font-medium">
            <p>Tu cuenta está inactiva y tu perfil está oculto para los clientes.</p>
            {asked ? (
              <p className="mt-1 font-bold">Tu solicitud de reactivación está en revisión.</p>
            ) : (
              <div className="mt-3">
                <Btn onClick={() => worker && askReactivation(worker.id)}>Solicitar reactivación</Btn>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {warnedNow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-3 rounded-2xl bg-gold-400/25 p-4 text-forest-900"
        >
          <AlertTriangle className="mt-0.5 shrink-0" size={20} />
          <p className="text-sm font-medium">
            Aviso: vas {done} de {min} trabajos este mes. Si no llegas al mínimo, tu cuenta pasará a inactiva.
          </p>
        </motion.div>
      )}

      <LinkBlock
        to="/trabajador/solicitudes"
        icon={ClipboardList}
        title="Solicitudes recibidas"
        text={
          pending > 0
            ? `Tienes ${pending} ${pending === 1 ? "solicitud pendiente" : "solicitudes pendientes"} por responder`
            : "No tienes solicitudes pendientes"
        }
        badge={pending}
      />

      <LinkBlock
        to="/trabajador/servicios"
        icon={Wrench}
        title="Mis servicios y fotos"
        text={worker?.published ? "Tu perfil está publicado" : "Tu perfil está en borrador: publícalo para aparecer en búsquedas"}
        delay={0.05}
      />

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
          <span className="flex items-center gap-2">
            Mínimo mensual de trabajos
            {inGrace && <span className="rounded-full bg-gold-400/30 px-2.5 py-0.5 text-xs font-bold">Período de gracia</span>}
          </span>
          <span>
            {done} / {min}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-forest-900/10">
          <motion.div
            key={`${done}-${min}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-forest-700 to-gold-400"
          />
        </div>
      </motion.div>
    </main>
  );
}

export function AdminHome() {
  const users = useAppStore((s) => s.users);
  const applications = useWorkStore((s) => s.applications);
  const reactivations = useWorkStore((s) => s.reactivations);
  useWorkStore((s) => s.lastEvaluation); // se actualiza al cerrar el mes

  const pending = applications.filter((a) => a.status === "en_revision").length;
  const verified = users.filter((u) => u.workerStatus === "verificado").length;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl uppercase text-forest-900">Panel del administrador</h1>
        <p className="text-forest-900/60">Verificación de trabajadores y parámetros</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={ClipboardList} label="Postulaciones en revisión" value={pending} delay={0.05} />
        <StatCard icon={ShieldCheck} label="Trabajadores verificados" value={verified} delay={0.1} />
        <StatCard icon={Activity} label="Reactivaciones solicitadas" value={reactivations.length} delay={0.15} />
        <StatCard icon={Users} label="Usuarios registrados" value={users.length} delay={0.2} />
      </div>

      <LinkBlock
        to="/admin/postulaciones"
        icon={UserCheck}
        title="Postulaciones"
        text={pending > 0 ? `${pending} por revisar` : "No hay postulaciones pendientes"}
        badge={pending}
      />
      <LinkBlock
        to="/admin/actividad"
        icon={Activity}
        title="Actividad mensual"
        text="Evalúa quién cumple el mínimo y gestiona reactivaciones"
        badge={reactivations.length}
        delay={0.05}
      />
      <LinkBlock to="/admin/configuracion" icon={Settings} title="Configuración" text="Anticipo, mínimo mensual y plazos" delay={0.1} />
    </main>
  );
}