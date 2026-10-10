import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  ExternalLink,
  MapPin,
  Paperclip,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import FileDrop from "../components/FileDrop";
import Modal from "../components/Modal";
import ReasonModal from "../components/ReasonModal";
import RequestOutcome from "../components/RequestOutcome";
import Timeline from "../components/Timeline";
import { formatDate, statusInfo, todayISO } from "../data/requests";
import type { Attachment, RequestStatus, ServiceRequest } from "../data/requests";
import { colones, workers } from "../data/workers";
import { useAppStore } from "../store/useAppStore";
import { useRequestsStore } from "../store/useRequestsStore";

type Tab = "pendientes" | "aceptadas" | "confirmar" | "historial";

const CLOSED: RequestStatus[] = ["finalizada", "rechazada", "cancelada", "vencida", "en_disputa"];

const TABS: { id: Tab; label: string; match: (s: RequestStatus) => boolean }[] = [
  { id: "pendientes", label: "Pendientes", match: (s) => s === "pendiente" },
  { id: "aceptadas", label: "Aceptadas", match: (s) => s === "aceptada" },
  { id: "confirmar", label: "Por confirmar", match: (s) => s === "pendiente_confirmacion" },
  { id: "historial", label: "Historial", match: (s) => CLOSED.includes(s) },
];

const EMPTY: Record<Tab, string> = {
  pendientes: "No tienes solicitudes pendientes por responder.",
  aceptadas: "No tienes servicios aceptados por realizar.",
  confirmar: "Ningún servicio está esperando confirmación del cliente.",
  historial: "Aquí aparecerán los servicios cerrados.",
};

type CardProps = {
  r: ServiceRequest;
  clientName: string;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
  onFinish: () => void;
  onExpire: () => void;
};

function RequestCard({ r, clientName, onAccept, onReject, onCancel, onFinish, onExpire }: CardProps) {
  const [open, setOpen] = useState(false);
  const st = statusInfo[r.status];
  const osm = `https://www.openstreetmap.org/?mlat=${r.location.lat}&mlon=${r.location.lng}#map=17/${r.location.lat}/${r.location.lng}`;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border-2 border-transparent bg-white p-4 shadow-md shadow-black/10 transition-[border-color,box-shadow] duration-300 hover:border-terracotta-500/60 hover:shadow-xl"
    >
      <div className="flex items-start gap-3">
        <Avatar name={clientName} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg uppercase tracking-wide text-forest-900">{r.serviceTitle}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${st.cls}`}>{st.label}</span>
          </div>
          <p className="text-sm font-semibold text-forest-700">
            {clientName} · {r.code}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-forest-900/60">
            <span className="flex items-center gap-1">
              <CalendarDays size={13} /> {formatDate(r.date)} · {r.slot}
            </span>
            <span className="flex items-center gap-1">
              <Banknote size={13} /> {r.advance > 0 ? `Anticipo pagado ${colones(r.advance)}` : "Sin anticipo"}
            </span>
            <span className="flex items-center gap-1">
              <Paperclip size={13} /> {r.attachments.length} adjunto(s)
            </span>
          </div>

          <p className="mt-3 whitespace-pre-line text-sm text-forest-900/80">{r.description}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-forest-900/70">
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {r.directions || `${r.location.lat.toFixed(4)}, ${r.location.lng.toFixed(4)}`}
            </span>
            <a
              href={osm}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1 font-semibold text-forest-700 underline-offset-4 transition-colors hover:text-terracotta-500 hover:underline"
            >
              Ver en el mapa
              <ExternalLink size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          </div>

          {r.attachments.length > 0 && (
            <ul className="mt-3 grid grid-cols-4 gap-2">
              {r.attachments.map((f) => (
                <li key={f.id} className="aspect-square overflow-hidden rounded-lg bg-forest-900/10">
                  {f.kind === "imagen" ? (
                    <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                  ) : (
                    <video src={f.url} controls className="h-full w-full object-cover" />
                  )}
                </li>
              ))}
            </ul>
          )}

          <RequestOutcome request={r} viewer="trabajador" />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {r.status === "pendiente" && (
              <>
                <Button onClick={onAccept}>
                  <Check size={16} className="transition-transform duration-200 group-hover:scale-125" />
                  Aceptar
                </Button>
                <Button variant="forest" onClick={onReject}>
                  <X size={16} className="transition-transform duration-200 group-hover:rotate-90" />
                  Rechazar
                </Button>
                <button
                  type="button"
                  onClick={onExpire}
                  className="text-xs font-semibold text-forest-900/50 underline-offset-4 transition-colors hover:text-terracotta-500 hover:underline"
                >
                  Demo: simular plazo vencido
                </button>
              </>
            )}
            {r.status === "aceptada" && (
              <>
                <Button onClick={onFinish}>
                  <Check size={16} className="transition-transform duration-200 group-hover:scale-125" />
                  Marcar como finalizado
                </Button>
                <Button variant="light" onClick={onCancel} className="ring-1 ring-forest-900/15">
                  Cancelar contratación
                </Button>
              </>
            )}
            {r.status === "pendiente_confirmacion" && (
              <p className="text-sm font-semibold text-forest-900/60">Esperando la confirmación del cliente…</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-forest-900/60 transition-colors hover:text-terracotta-500"
          >
            Historial
            <ChevronDown size={14} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 pl-1">
                  <Timeline events={r.events} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}

export default function WorkerRequests() {
  const user = useAppStore((s) => s.currentUser);
  const users = useAppStore((s) => s.users);
  const showToast = useAppStore((s) => s.showToast);
  const requests = useRequestsStore((s) => s.requests);
  const accept = useRequestsStore((s) => s.accept);
  const reject = useRequestsStore((s) => s.reject);
  const expire = useRequestsStore((s) => s.expire);
  const cancel = useRequestsStore((s) => s.cancel);
  const finish = useRequestsStore((s) => s.finish);

  const [tab, setTab] = useState<Tab>("pendientes");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [finishId, setFinishId] = useState<string | null>(null);
  const [conflictId, setConflictId] = useState<string | null>(null);
  const [finishFiles, setFinishFiles] = useState<Attachment[]>([]);

  const worker = workers.find((w) => w.userId === user?.id);
  const mine = worker ? requests.filter((r) => r.workerId === worker.id) : [];
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  const visible = mine.filter((r) => current.match(r.status));

  const clientName = (id: string) => users.find((u) => u.id === id)?.name ?? "Cliente";
  const byId = (id: string | null) => (id ? mine.find((r) => r.id === id) : undefined);

  const rejecting = byId(rejectId);
  const cancelling = byId(cancelId);
  const finishing = byId(finishId);
  const conflicting = byId(conflictId);
  const other = conflicting
    ? mine.find(
        (x) =>
          x.id !== conflicting.id &&
          x.status === "aceptada" &&
          x.date === conflicting.date &&
          x.slot === conflicting.slot,
      )
    : undefined;

  const doAccept = (r: ServiceRequest) => {
    accept(r.id);
    setConflictId(null);
    setTab("aceptadas");
    showToast("success", `Solicitud ${r.code} aceptada. Se notificó al cliente (simulado).`);
  };

  // Excepción B de CU-09: conflicto con otro servicio ya aceptado en la misma fecha y hora
  const tryAccept = (r: ServiceRequest) => {
    const clash = mine.some(
      (x) => x.id !== r.id && x.status === "aceptada" && x.date === r.date && x.slot === r.slot,
    );
    if (clash) setConflictId(r.id);
    else doAccept(r);
  };

  const closeFinish = () => {
    setFinishId(null);
    setFinishFiles([]);
  };

  const doFinish = () => {
    if (!finishing) return;
    finish(finishing.id, finishFiles);
    closeFinish();
    setTab("confirmar");
    showToast("success", "Servicio marcado como finalizado. Se pidió la confirmación al cliente (simulado).");
  };

  if (!worker) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="font-semibold text-forest-900">No encontramos tu perfil de trabajador.</p>
      </main>
    );
  }

  return (
    <>
      <section className="rounded-b-[2rem] bg-forest-900 pb-6 text-white">
        <div className="mx-auto max-w-3xl px-4">
          <Link
            to="/trabajador"
            className="group inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
            Mi panel
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 font-display text-3xl uppercase tracking-wide"
          >
            Solicitudes recibidas
          </motion.h1>
          <p className="text-white/70">Responde, realiza y cierra los servicios que te piden.</p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl space-y-4 px-4 pb-16 pt-6">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-forest-900/5 p-1 [scrollbar-width:none]">
          {TABS.map((t) => {
            const count = mine.filter((r) => t.match(r.status)).length;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() => setTab(t.id)}
                className="relative flex-1 shrink-0 rounded-lg px-3 py-2 text-sm font-bold"
              >
                {active && (
                  <motion.span
                    layoutId="worker-tab"
                    className="absolute inset-0 rounded-lg bg-white shadow"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={`relative flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors ${
                    active ? "text-forest-900" : "text-forest-900/50 hover:text-forest-900"
                  }`}
                >
                  {t.label}
                  {count > 0 && (
                    <span
                      className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] ${
                        t.id === "pendientes" ? "bg-terracotta-500 text-white" : "bg-forest-900/10"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {visible.length === 0 ? (
          <motion.div
            key={tab}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-14 text-center shadow-md shadow-black/5"
          >
            <ClipboardList size={40} className="text-terracotta-500" />
            <p className="text-sm font-semibold text-forest-900/70">{EMPTY[tab]}</p>
          </motion.div>
        ) : (
          <motion.div layout className="space-y-4">
            <AnimatePresence mode="popLayout">
              {visible.map((r) => (
                <RequestCard
                  key={r.id}
                  r={r}
                  clientName={clientName(r.clientId)}
                  onAccept={() => tryAccept(r)}
                  onReject={() => setRejectId(r.id)}
                  onCancel={() => setCancelId(r.id)}
                  onFinish={() => setFinishId(r.id)}
                  onExpire={() => {
                    expire(r.id);
                    setTab("historial");
                    showToast("info", "Plazo vencido (demo): el anticipo se devolvió al cliente.");
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Rechazar (CU-09, flujo alterno 3a) */}
      <ReasonModal
        open={!!rejecting}
        title="Rechazar solicitud"
        description={
          rejecting && (
            <p>
              Se devolverá el anticipo ({colones(rejecting.advance)}) a {clientName(rejecting.clientId)} y se le
              sugerirán otros trabajadores.
            </p>
          )
        }
        confirmLabel="Rechazar solicitud"
        suggestions={["No tengo disponibilidad en esa fecha", "Está fuera de mi zona", "No ofrezco ese tipo de trabajo"]}
        onConfirm={(reason) => {
          if (!rejecting) return;
          reject(rejecting.id, reason);
          setRejectId(null);
          setTab("historial");
          showToast("info", "Solicitud rechazada. Se devolvió el anticipo al cliente (simulado).");
        }}
        onClose={() => setRejectId(null)}
      />

      {/* Cancelar contratación aceptada (CU-10, flujo alterno 1a) */}
      <ReasonModal
        open={!!cancelling}
        title="Cancelar contratación"
        description={
          cancelling && (
            <p>
              El anticipo ({colones(cancelling.advance)}) se devolverá <strong>completo</strong> al cliente y la
              cancelación quedará registrada en tu historial.
            </p>
          )
        }
        confirmLabel="Cancelar contratación"
        suggestions={["Tuve una emergencia", "No puedo llegar a esa hora", "Me surgió otro trabajo urgente"]}
        onConfirm={(reason) => {
          if (!cancelling) return;
          cancel(cancelling.id, "trabajador", reason);
          setCancelId(null);
          setTab("historial");
          showToast("info", "Contratación cancelada. El cliente fue notificado y recibió su anticipo (simulado).");
        }}
        onClose={() => setCancelId(null)}
      />

      {/* Conflicto de horario (CU-09, excepción B) */}
      <Modal open={!!conflicting} title="Conflicto de horario" onClose={() => setConflictId(null)}>
        {conflicting && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-xl bg-gold-400/20 p-3 text-sm text-forest-900">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-gold-500" />
              <p>
                Ya tienes aceptado {other ? <strong>{other.code}</strong> : "otro servicio"} el mismo día a las{" "}
                {conflicting.slot}. ¿Qué quieres hacer con {conflicting.code}?
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setConflictId(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-forest-900 transition-colors hover:bg-forest-900/5"
              >
                Volver
              </button>
              <Button
                variant="forest"
                onClick={() => {
                  setConflictId(null);
                  setRejectId(conflicting.id);
                }}
              >
                Rechazar esta solicitud
              </Button>
              <Button onClick={() => doAccept(conflicting)}>Aceptar de todas formas</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Finalizar con fotos (CU-11) */}
      <Modal open={!!finishing} title="Finalizar servicio" onClose={closeFinish}>
        {finishing && (
          <div className="space-y-4">
            {finishing.date > todayISO() && (
              <div className="flex items-start gap-2 rounded-xl bg-gold-400/20 p-3 text-sm text-forest-900">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-gold-500" />
                <p>
                  Este servicio estaba programado para el <strong>{formatDate(finishing.date)}</strong>. ¿Seguro que ya
                  lo terminaste?
                </p>
              </div>
            )}
            <FileDrop files={finishFiles} onChange={setFinishFiles} title="Agrega fotos del resultado (opcional)" />
            <p className="text-xs text-forest-900/60">
              El cliente recibirá un aviso para confirmar que el servicio se realizó.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeFinish}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-forest-900 transition-colors hover:bg-forest-900/5"
              >
                Volver
              </button>
              <Button onClick={doFinish}>{finishing.date > todayISO() ? "Finalizar de todas formas" : "Marcar como finalizado"}</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}