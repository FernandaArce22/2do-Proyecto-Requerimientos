import { useState } from "react";
import { History, Save } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useRequestsStore } from "../store/useRequestsStore";
import { useWorkStore, describeChanges } from "../store/useWorkStore";
import type { FullSettings } from "../store/useWorkStore";
import TextField from "../components/TextField";
import { Banner, Btn, Card, Dialog, PageTitle, when } from "../components/Ui";

type Key = keyof FullSettings;
const fields: { key: Key; label: string; min: number; max: number; help: string }[] = [
  { key: "advancePercent", label: "Anticipo al contratar (%)", min: 0, max: 50, help: "Se cobra al aceptar el trabajo. Máximo 50 %." },
  { key: "cancelFeePercent", label: "Tarifa por cancelación tardía (%)", min: 0, max: 100, help: "Porcentaje del anticipo que se retiene." },
  { key: "minMonthly", label: "Mínimo mensual de trabajos", min: 0, max: 30, help: "Trabajos completados para mantener la cuenta activa." },
  { key: "maxInactiveDays", label: "Días máximos sin trabajar", min: 7, max: 180, help: "Superado este plazo la cuenta se inactiva." },
  { key: "graceDays", label: "Período de gracia (días)", min: 0, max: 90, help: "Para cuentas nuevas o reactivadas." },
];

export default function AdminSettings() {
  const admin = useAppStore((s) => s.currentUser);
  const req = useRequestsStore((s) => s.settings);
  const work = useWorkStore((s) => s.settings);
  const log = useWorkStore((s) => s.settingsLog);
  const save = useWorkStore((s) => s.saveSettings);

  const current: FullSettings = { ...work, advancePercent: req.advancePercent, cancelFeePercent: req.cancelFeePercent };

  const [vals, setVals] = useState<Record<Key, string>>({
    advancePercent: String(current.advancePercent),
    cancelFeePercent: String(current.cancelFeePercent),
    minMonthly: String(current.minMonthly),
    maxInactiveDays: String(current.maxInactiveDays),
    graceDays: String(current.graceDays),
  });
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [next, setNext] = useState<FullSettings | null>(null);
  const [msg, setMsg] = useState("");

  const review = () => {
    const e: Partial<Record<Key, string>> = {};
    const parsed = {} as FullSettings;
    fields.forEach((f) => {
      const raw = vals[f.key].trim();
      const n = Number(raw);
      if (raw === "" || !Number.isInteger(n)) e[f.key] = "Escribe un número entero.";
      else if (n < f.min || n > f.max) e[f.key] = `Debe estar entre ${f.min} y ${f.max}.`;
      else parsed[f.key] = n;
    });
    setErrors(e);
    setMsg("");
    if (Object.keys(e).length) return;
    if (describeChanges(current, parsed).length === 0) return setMsg("No hay cambios por guardar.");
    setNext(parsed);
  };

  const confirm = () => {
    if (!next) return;
    const changes = save(next, admin?.name ?? "Administrador");
    setNext(null);
    setMsg(`Configuración guardada (${changes.length} cambio${changes.length === 1 ? "" : "s"}).`);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <PageTitle title="Configuración" sub="Parámetros del negocio. Los cambios aplican solo a solicitudes nuevas." />
      <div className="space-y-4">
        {msg && <Banner tone={msg.startsWith("No") ? "info" : "ok"}>{msg}</Banner>}
        <Card>
          <div className="space-y-5">
            {fields.map((f) => (
              <div key={f.key}>
                <TextField
                  inputMode="numeric"
                  label={f.label}
                  value={vals[f.key]}
                  onChange={(v) => setVals((s) => ({ ...s, [f.key]: v }))}
                  error={errors[f.key]}
                />
                <p className="mt-1 text-xs text-forest-900/60">{f.help}</p>
              </div>
            ))}
            <Btn full onClick={review}>
              <Save size={16} /> Revisar cambios
            </Btn>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg uppercase text-forest-950">
            <History size={18} /> Historial de cambios
          </h2>
          {log.length === 0 ? (
            <p className="text-sm text-forest-900/70">Aún no se ha modificado la configuración.</p>
          ) : (
            <ul className="space-y-3">
              {log.map((l, i) => (
                <li key={i} className="text-sm">
                  <p className="text-xs text-forest-900/60">
                    {when(l.at)} · {l.by}
                  </p>
                  {l.changes.map((c) => (
                    <p key={c} className="font-medium text-forest-900">
                      {c}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Dialog
        open={!!next}
        title="Confirma los cambios"
        onClose={() => setNext(null)}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setNext(null)}>
              Volver
            </Btn>
            <Btn onClick={confirm}>Guardar</Btn>
          </>
        }
      >
        {next && (
          <ul className="space-y-2 text-sm font-medium text-forest-900">
            {describeChanges(current, next).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
      </Dialog>
    </main>
  );
}
