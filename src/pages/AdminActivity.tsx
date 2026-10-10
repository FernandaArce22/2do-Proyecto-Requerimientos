import { useState } from "react";
import { motion } from "framer-motion";
import { BellRing, CalendarCheck } from "lucide-react";
import { workers } from "../data/workers";
import { useWorkStore } from "../store/useWorkStore";
import { useRequestsStore } from "../store/useRequestsStore";
import type { EvalVerdict } from "../store/useWorkStore";
import { Banner, Btn, Card, Dialog, PageTitle, when } from "../components/Ui";

const chip: Record<EvalVerdict, { label: string; cls: string }> = {
  cumple: { label: "Cumple", cls: "bg-forest-700/15 text-forest-800" },
  gracia: { label: "En gracia", cls: "bg-gold-400/30 text-forest-900" },
  incumple: { label: "En riesgo", cls: "bg-terracotta-500/15 text-terracotta-600" },
};

export default function AdminActivity() {
  // Se suscribe a lo que cambia para volver a evaluar al renderizar
  const settings = useWorkStore((s) => s.settings);
  const warned = useWorkStore((s) => s.warned);
  const reactivations = useWorkStore((s) => s.reactivations);
  const last = useWorkStore((s) => s.lastEvaluation);
  const requests = useRequestsStore((s) => s.requests);
  const evaluate = useWorkStore((s) => s.evaluate);
  const sendWarnings = useWorkStore((s) => s.sendWarnings);
  const closeMonth = useWorkStore((s) => s.closeMonth);
  const resolve = useWorkStore((s) => s.resolveReactivation);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [msg, setMsg] = useState("");

  void requests; // fuerza nuevo cálculo cuando cambian los trabajos
  void settings;
  const rows = evaluate();
  const inactive = workers.filter((w) => w.verified && !w.active);
  const atRisk = rows.filter((r) => r.verdict === "incumple").length;

  const warn = () => {
    const n = sendWarnings();
    setMsg(n === 0 ? "Nadie está en riesgo: no se enviaron avisos." : `Aviso preventivo enviado a ${n} trabajador${n === 1 ? "" : "es"}.`);
  };

  const close = () => {
    setConfirmOpen(false);
    const res = closeMonth();
    const n = res.filter((r) => r.verdict === "incumple").length;
    setMsg(n === 0 ? "Mes cerrado: todos cumplen." : `Mes cerrado: ${n} cuenta${n === 1 ? "" : "s"} pasaron a inactiva.`);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PageTitle title="Actividad mensual" sub="Evalúa quién cumple el mínimo para mantener la cuenta activa." />
      <div className="space-y-4">
        {msg && <Banner>{msg}</Banner>}

        <Card>
          <p className="mb-4 text-sm text-forest-900/70">
            Regla actual: mínimo <strong>{settings.minMonthly}</strong> trabajos al mes y no pasar más de <strong>{settings.maxInactiveDays}</strong> días sin trabajar.
          </p>
          <ul className="space-y-3">
            {rows.map((r) => {
              const pct = r.min === 0 ? 100 : Math.min(100, Math.round((r.monthJobs / r.min) * 100));
              return (
                <li key={r.workerId} className="rounded-2xl bg-cream-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-forest-950">{r.name}</p>
                    <div className="flex items-center gap-2">
                      {warned[r.workerId] && <span className="text-xs font-semibold text-terracotta-600">Avisado</span>}
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${chip[r.verdict].cls}`}>{chip[r.verdict].label}</span>
                    </div>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-forest-900/10">
                    <motion.div
                      className={`h-full rounded-full ${r.verdict === "incumple" ? "bg-terracotta-500" : "bg-forest-700"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7 }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-forest-900/70">
                    {r.monthJobs} de {r.min} trabajos · {r.reason}
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={warn} disabled={atRisk === 0}>
              <BellRing size={16} /> Enviar avisos preventivos
            </Btn>
            <Btn onClick={() => setConfirmOpen(true)}>
              <CalendarCheck size={16} /> Cerrar mes y evaluar (simulado)
            </Btn>
          </div>
        </Card>

        {last && (
          <Card>
            <h2 className="font-display text-lg uppercase text-forest-950">Último cierre</h2>
            <p className="text-sm text-forest-900/70">
              {when(last.at)} · {last.deactivated} cuenta{last.deactivated === 1 ? "" : "s"} desactivada{last.deactivated === 1 ? "" : "s"}
            </p>
          </Card>
        )}

        <Card>
          <h2 className="mb-3 font-display text-lg uppercase text-forest-950">Cuentas inactivas ({inactive.length})</h2>
          {inactive.length === 0 ? (
            <p className="text-sm text-forest-900/70">No hay cuentas inactivas.</p>
          ) : (
            <ul className="space-y-3">
              {inactive.map((w) => {
                const asked = reactivations.includes(w.id);
                return (
                  <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-cream-50 p-4">
                    <div>
                      <p className="font-bold text-forest-950">{w.name}</p>
                      <p className="text-xs text-forest-900/70">{asked ? "Solicitó reactivación" : "Sin solicitud de reactivación"}</p>
                    </div>
                    {asked && (
                      <div className="flex gap-2">
                        <Btn variant="danger" onClick={() => resolve(w.id, false)}>
                          Rechazar
                        </Btn>
                        <Btn onClick={() => resolve(w.id, true)}>Reactivar</Btn>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Dialog
        open={confirmOpen}
        title="Cerrar el mes"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Btn>
            <Btn variant="danger" onClick={close}>
              Cerrar mes
            </Btn>
          </>
        }
      >
        <p className="text-sm text-forest-900">
          Se desactivarán {atRisk} cuenta{atRisk === 1 ? "" : "s"} que no cumplen. Dejarán de aparecer en las búsquedas hasta que se reactiven.
        </p>
      </Dialog>
    </main>
  );
}
