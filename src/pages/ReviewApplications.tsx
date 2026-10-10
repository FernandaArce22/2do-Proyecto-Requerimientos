import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, FileSearch } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useWorkStore } from "../store/useWorkStore";
import { appStatusInfo } from "../data/work";
import type { Application } from "../data/work";
import { categories } from "../data/mockData";
import { DocPreview } from "../components/DocUpload";
import TextAreaField from "../components/TextAreaField";
import { Banner, Btn, Card, Dialog, PageTitle, when } from "../components/Ui";

const catName = (id: string) => {
  const c = (categories as unknown as Record<string, string>[]).find((x) => x.id === id);
  return c ? (c.name ?? c.label ?? id) : id;
};

type Mode = "reject" | "info" | null;

export default function ReviewApplications() {
  const admin = useAppStore((s) => s.currentUser);
  const users = useAppStore((s) => s.users);
  const apps = useWorkStore((s) => s.applications);
  const approve = useWorkStore((s) => s.approve);
  const reject = useWorkStore((s) => s.reject);
  const requestInfo = useWorkStore((s) => s.requestInfo);

  const [tab, setTab] = useState<"pend" | "res">("pend");
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>(null);
  const [modeId, setModeId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState<{ text: string; tone: "ok" | "warn" } | null>(null);

  const adminName = admin?.name ?? "Administrador";
  const list = apps.filter((a) => (tab === "pend" ? a.status === "en_revision" : a.status !== "en_revision"));
  const opened = apps.find((a) => a.id === openId);
  const nameOf = (a: Application) => users.find((u) => u.id === a.userId)?.name ?? "Usuario";

  const doApprove = (a: Application) => {
    setOpenId(null);
    const ok = approve(a.id, adminName);
    setMsg(
      ok
        ? { text: `${nameOf(a)} fue verificado y ya puede publicar sus servicios.`, tone: "ok" }
        : { text: "Esta postulación ya fue resuelta por otra persona.", tone: "warn" },
    );
  };

  const startMode = (a: Application, m: Mode) => {
    setOpenId(null);
    setModeId(a.id);
    setMode(m);
    setText("");
    setErr("");
  };

  const closeMode = () => {
    setMode(null);
    setModeId(null);
  };

  const confirmMode = () => {
    if (text.trim().length < 5) return setErr("Escribe al menos 5 caracteres.");
    if (!modeId) return;
    const ok = mode === "reject" ? reject(modeId, text.trim(), adminName) : requestInfo(modeId, text.trim(), adminName);
    setMsg(
      ok
        ? { text: mode === "reject" ? "Postulación rechazada. Se notificó al postulante." : "Se pidió información adicional al postulante.", tone: "ok" }
        : { text: "Esta postulación ya fue resuelta por otra persona.", tone: "warn" },
    );
    closeMode();
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PageTitle title="Postulaciones" sub="Revisa los documentos y verifica a quienes quieren ofrecer servicios." />
      {msg && (
        <div className="mb-4">
          <Banner tone={msg.tone}>{msg.text}</Banner>
        </div>
      )}

      <div className="mb-5 flex gap-2">
        {(["pend", "res"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative rounded-full px-5 py-2 text-sm font-bold transition-colors duration-200 ${
              tab === t ? "text-white" : "text-forest-900 hover:bg-forest-900/10"
            }`}
          >
            {tab === t && <motion.span layoutId="rev-tab" className="absolute inset-0 rounded-full bg-forest-800" />}
            <span className="relative">{t === "pend" ? "En revisión" : "Resueltas"}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Card>
          <p className="text-center text-forest-900/70">No hay postulaciones en esta lista.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <motion.button
              key={a.id}
              type="button"
              onClick={() => setOpenId(a.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              className="group flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-forest-900/5 transition-shadow hover:shadow-lg"
            >
              <FileSearch className="text-forest-700" size={26} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-forest-950">{nameOf(a)}</p>
                <p className="truncate text-sm text-forest-900/70">
                  {a.categories.map(catName).join(", ")} · {a.zone} · {when(a.submittedAt)}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${appStatusInfo[a.status].cls}`}>{appStatusInfo[a.status].label}</span>
              <ChevronRight className="transition-transform group-hover:translate-x-1" size={18} />
            </motion.button>
          ))}
        </div>
      )}

      <Dialog
        open={!!opened}
        wide
        title={opened ? `Postulación de ${nameOf(opened)}` : ""}
        onClose={() => setOpenId(null)}
        footer={
          opened && opened.status === "en_revision" ? (
            <>
              <Btn variant="ghost" onClick={() => startMode(opened, "info")}>
                Pedir información
              </Btn>
              <Btn variant="danger" onClick={() => startMode(opened, "reject")}>
                Rechazar
              </Btn>
              <Btn onClick={() => doApprove(opened)}>Aprobar y verificar</Btn>
            </>
          ) : undefined
        }
      >
        {opened && (
          <div className="space-y-4 text-sm">
            <p>
              <strong>Servicios:</strong> {opened.categories.map(catName).join(", ")}
            </p>
            <p>
              <strong>Zona:</strong> {opened.zone}
            </p>
            <p>
              <strong>Experiencia:</strong> {opened.experience}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 font-bold">Cédula</p>
                <DocPreview doc={opened.idDoc} />
              </div>
              <div>
                <p className="mb-1 font-bold">Respaldo</p>
                <DocPreview doc={opened.backupDoc} />
              </div>
            </div>
            {opened.infoRequest && (
              <p>
                <strong>Información pedida:</strong> {opened.infoRequest}
                <br />
                <strong>Respuesta:</strong> {opened.infoReply ?? "Aún sin responder"}
              </p>
            )}
            {opened.decisionReason && (
              <p>
                <strong>Motivo del rechazo:</strong> {opened.decisionReason}
              </p>
            )}
            <ol className="space-y-1 border-l-2 border-forest-900/10 pl-3">
              {opened.history.map((h, i) => (
                <li key={i} className="text-xs text-forest-900/70">
                  {when(h.at)} · {h.label}
                </li>
              ))}
            </ol>
          </div>
        )}
      </Dialog>

      <Dialog
        open={mode !== null}
        title={mode === "reject" ? "Rechazar postulación" : "Pedir información adicional"}
        onClose={closeMode}
        footer={
          <>
            <Btn variant="ghost" onClick={closeMode}>
              Cancelar
            </Btn>
            <Btn variant={mode === "reject" ? "danger" : "primary"} onClick={confirmMode}>
              {mode === "reject" ? "Rechazar" : "Enviar solicitud"}
            </Btn>
          </>
        }
      >
        <TextAreaField
          label={mode === "reject" ? "Motivo (lo verá el postulante)" : "¿Qué necesitas que aclare?"}
          value={text}
          onChange={setText}
          error={err}
          rows={3}
          max={300}
        />
      </Dialog>
    </main>
  );
}
