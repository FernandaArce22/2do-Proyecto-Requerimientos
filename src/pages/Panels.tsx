import { motion } from "framer-motion";
import { AlertTriangle, CalendarCheck, ClipboardList, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

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
  if (!user) return null;

  // Valores de ejemplo hasta implementar CU-13
  const done = 2;
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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard icon={ClipboardList} label="Solicitudes pendientes" value={0} delay={0.05} />
        <StatCard icon={CalendarCheck} label="Último trabajo" value="hace 4 días" delay={0.1} />
        <StatCard icon={ShieldCheck} label="Estado de la cuenta" value={user.accountActive ? "Activa" : "Inactiva"} delay={0.15} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
            initial={{ width: 0 }}
            animate={{ width: `${(done / min) * 100}%` }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-forest-700 to-gold-400"
          />
        </div>
      </motion.div>

      <SoonCard text="Próximamente: bandeja de solicitudes (CU-09) y perfil de servicios (CU-05)." />
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