import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, Clock, XCircle } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useWorkStore } from "../store/useWorkStore";
import type { Doc } from "../data/work";
import { appStatusInfo } from "../data/work";
import { zones } from "../data/workers";
import { categories } from "../data/mockData";
import DocUpload from "../components/DocUpload";
import SelectField from "../components/SelectField";
import TextAreaField from "../components/TextAreaField";
import { Banner, Btn, Card, Dialog, PageTitle, when } from "../components/Ui";

type Cat = { id: string; name: string };
const catList = (categories as unknown as Record<string, string>[]).map((c) => ({
  id: c.id,
  name: c.name ?? c.label ?? c.id,
})) as Cat[];
const zoneList = (zones as unknown as unknown[]).map(String);

export default function Apply() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.currentUser);
  const switchRole = useAppStore((s) => s.switchRole);
  const apps = useWorkStore((s) => s.applications);
  const submit = useWorkStore((s) => s.submitApplication);
  const replyInfo = useWorkStore((s) => s.replyInfo);

  const app = apps.find((a) => a.userId === user?.id);

  const [editing, setEditing] = useState(false);
  const [cats, setCats] = useState<string[]>(app?.categories ?? []);
  const [exp, setExp] = useState(app?.experience ?? "");
  const [zone, setZone] = useState(app?.zone ?? "");
  const [idDoc, setIdDoc] = useState<Doc | null>(null);
  const [backup, setBackup] = useState<Doc | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState(false);
  const [reply, setReply] = useState("");
  const [replyErr, setReplyErr] = useState("");

  if (!user) return null;

  const toggleCat = (id: string) => setCats((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const validate = () => {
    const e: Record<string, string> = {};
    if (cats.length === 0) e.cats = "Elige al menos una categoría.";
    if (exp.trim().length < 30) e.exp = "Cuéntanos tu experiencia con al menos 30 caracteres.";
    if (!zone) e.zone = "Selecciona la zona donde trabajas.";
    if (!idDoc) e.idDoc = "Sube una foto o PDF de tu cédula.";
    if (!backup) e.backup = "Sube un documento de respaldo (referencias, certificado, etc.).";
    setErrors(e);
    if (Object.keys(e).length === 0) setSummary(true);
  };

  const confirm = () => {
    if (!idDoc || !backup) return;
    submit(user.id, { categories: cats, experience: exp.trim(), zone, idDoc, backupDoc: backup });
    setSummary(false);
    setEditing(false);
  };

  // ---- Vista: ya verificado ----
  if (user.workerStatus === "verificado") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <PageTitle title="Ya eres trabajador verificado" />
        <Card>
          <div className="flex items-center gap-3 text-forest-800">
            <BadgeCheck className="text-gold-500" size={32} />
            <p className="font-semibold">Tu postulación fue aprobada. Ya puedes publicar tus servicios.</p>
          </div>
          <div className="mt-5">
            <Btn
              onClick={() => {
                switchRole("trabajador");
                navigate("/trabajador/servicios");
              }}
            >
              Ir a mis servicios
            </Btn>
          </div>
        </Card>
      </main>
    );
  }

  // ---- Vista: en revisión ----
  if (app && app.status === "en_revision" && !editing) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <PageTitle title="Tu postulación" sub="Un administrador está revisando tus documentos." />
        <Card>
          <div className="flex items-center gap-3">
            <Clock className="text-gold-500" size={30} />
            <div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${appStatusInfo.en_revision.cls}`}>
                {appStatusInfo.en_revision.label}
              </span>
              <p className="mt-1 text-sm text-forest-900/70">Enviada el {when(app.submittedAt)}. Tiempo estimado: 1 a 2 días hábiles.</p>
            </div>
          </div>

          <ol className="mt-5 space-y-3 border-l-2 border-forest-900/10 pl-4">
            {app.history.map((h, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <p className="text-sm font-semibold text-forest-900">{h.label}</p>
                <p className="text-xs text-forest-900/60">{when(h.at)}</p>
              </motion.li>
            ))}
          </ol>

          {app.infoRequest && (
            <div className="mt-6 space-y-3">
              <Banner tone="info">
                <strong>El administrador pide más información:</strong> {app.infoRequest}
              </Banner>
              {app.infoReply ? (
                <Banner>Tu respuesta fue enviada: “{app.infoReply}”</Banner>
              ) : (
                <>
                  <TextAreaField label="Tu respuesta" value={reply} onChange={setReply} error={replyErr} rows={3} max={400} />
                  <Btn
                    onClick={() => {
                      if (reply.trim().length < 5) return setReplyErr("Escribe una respuesta de al menos 5 caracteres.");
                      setReplyErr("");
                      replyInfo(app.id, reply.trim());
                      setReply("");
                    }}
                  >
                    Enviar respuesta
                  </Btn>
                </>
              )}
            </div>
          )}
        </Card>
      </main>
    );
  }

  // ---- Vista: rechazada (sin editar) ----
  if (app && app.status === "rechazada" && !editing) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <PageTitle title="Tu postulación" />
        <Card>
          <div className="flex items-center gap-3">
            <XCircle className="text-terracotta-500" size={30} />
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${appStatusInfo.rechazada.cls}`}>
              {appStatusInfo.rechazada.label}
            </span>
          </div>
          <p className="mt-4 text-sm text-forest-900">
            <strong>Motivo:</strong> {app.decisionReason}
          </p>
          <div className="mt-5">
            <Btn onClick={() => setEditing(true)}>Corregir y reenviar</Btn>
          </div>
        </Card>
      </main>
    );
  }

  // ---- Formulario ----
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <PageTitle title="Quiero ofrecer servicios" sub="Completa tu postulación. Verificamos a cada trabajador para que los clientes contraten con confianza." />
      <Card>
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-semibold text-forest-900">¿Qué servicios ofreces?</p>
            <div className="flex flex-wrap gap-2">
              {catList.map((c) => {
                const on = cats.includes(c.id);
                return (
                  <motion.button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCat(c.id)}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.94 }}
                    aria-pressed={on}
                    className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors duration-200 ${
                      on
                        ? "border-forest-800 bg-forest-800 text-white"
                        : "border-forest-900/20 bg-white text-forest-900 hover:border-terracotta-500 hover:text-terracotta-600"
                    }`}
                  >
                    {c.name}
                  </motion.button>
                );
              })}
            </div>
            {errors.cats && <p className="mt-1.5 text-xs font-medium text-terracotta-600">{errors.cats}</p>}
          </div>

          <TextAreaField
            label="Tu experiencia"
            value={exp}
            onChange={setExp}
            error={errors.exp}
            placeholder="Cuántos años llevas, qué trabajos has hecho…"
            max={500}
          />

          <SelectField label="Zona donde trabajas" value={zone} onChange={setZone} error={errors.zone}>
            <option value="">Selecciona…</option>
            {zoneList.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </SelectField>

          <DocUpload label="Cédula (foto o PDF)" hint="JPG, PNG o PDF · máx. 5 MB" value={idDoc} onChange={setIdDoc} error={errors.idDoc} />
          <DocUpload label="Documento de respaldo" hint="Referencias, certificado o carné · máx. 5 MB" value={backup} onChange={setBackup} error={errors.backup} />

          <Btn full onClick={validate}>
            Revisar y enviar
          </Btn>
        </div>
      </Card>

      <Dialog
        open={summary}
        title="Confirma tu postulación"
        onClose={() => setSummary(false)}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setSummary(false)}>
              Volver
            </Btn>
            <Btn onClick={confirm}>Enviar postulación</Btn>
          </>
        }
      >
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-bold text-forest-900">Servicios</dt>
            <dd>{catList.filter((c) => cats.includes(c.id)).map((c) => c.name).join(", ")}</dd>
          </div>
          <div>
            <dt className="font-bold text-forest-900">Zona</dt>
            <dd>{zone}</dd>
          </div>
          <div>
            <dt className="font-bold text-forest-900">Experiencia</dt>
            <dd>{exp}</dd>
          </div>
          <div>
            <dt className="font-bold text-forest-900">Documentos</dt>
            <dd>{idDoc?.name} · {backup?.name}</dd>
          </div>
        </dl>
      </Dialog>
    </main>
  );
}
