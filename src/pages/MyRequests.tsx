import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Banknote, CalendarDays, Check, ChevronDown, ClipboardList, Flag, Paperclip, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ReasonModal from "../components/ReasonModal";
import RequestOutcome from "../components/RequestOutcome";
import StarInput from "../components/StarInput";
import Stepper from "../components/Stepper";
import Timeline from "../components/Timeline";
import { FLOW_STEPS, flowIndex, formatDate, roundAdvance, statusInfo } from "../data/requests";
import type { Rating, RequestStatus, ServiceRequest } from "../data/requests";
import { colones, workers } from "../data/workers";
import { useAppStore } from "../store/useAppStore";
import { useRequestsStore } from "../store/useRequestsStore";
import { normalize } from "../utils/search";

type Tab = "activas" | "finalizadas" | "otras";

const TAB_IDS: Tab[] = ["activas", "finalizadas", "otras"];
const TAB_LABELS: Record<Tab, string> = {
  activas: "Activas",
  finalizadas: "Finalizadas",
  otras: "Canceladas y otras",
};

const tabOf = (s: RequestStatus): Tab =>
  s === "pendiente" || s === "aceptada" || s === "pendiente_confirmacion"
    ? "activas"
    : s === "finalizada"
      ? "finalizadas"
      : "otras";

// Criterio provisional de lenguaje inapropiado (CU-12, excepción B: por confirmar)
const BAD_WORDS = ["idiota", "estupido", "imbecil", "basura", "mierda", "maldito"];

function RateModal({
  open,
  workerName,
  onSubmit,
  onClose,
}: {
  open: boolean;
  workerName: string;
  onSubmit: (rating: Rating) => void;
  onClose: () => void;
}) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setStars(0);
    setComment("");
    setError("");
  };
  const close = () => {
    reset();
    onClose();
  };
  const submit = () => {
    if (stars === 0) {
      setError("Elige de 1 a 5 estrellas.");
      return;
    }
    const text = normalize(comment);
    if (BAD_WORDS.some((w) => text.includes(w))) {
      setError("Tu comentario contiene lenguaje inapropiado. Por favor reformúlalo.");
      return;
    }
    const value = { stars, comment: comment.trim() };
    reset();
    onSubmit(value);
  };

  return (
    <Modal open={open} title="Califica el servicio" onClose={close}>
      <div className="space-y-4">
        <p className="text-sm text-forest-900/70">¿Cómo fue tu experiencia con {workerName}?</p>
        <StarInput
          value={stars}
          onChange={(v) => {
            setStars(v);
            setError("");
          }}
        />
        <div>
          <label htmlFor="comentario" className="mb-1.5 block text-sm font-semibold text-forest-900">
            Comentario (opcional)
          </label>
          <textarea
            id="comentario"
            rows={3}
            maxLength={300}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setError("");
            }}
            placeholder="Cuéntales a otros clientes cómo te fue…"
            className="w-full resize-none rounded-xl border-2 border-forest-900/15 bg-white px-4 py-3 text-forest-950 outline-none transition-all duration-200 placeholder:text-forest-900/35 hover:border-forest-900/40 focus:border-forest-700 focus:shadow-md focus:shadow-forest-700/15"
          />
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-1 text-xs font-medium text-terracotta-600"
            >
              <AlertCircle size={13} /> {error}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-forest-900 transition-colors hover:bg-forest-900/5"
          >
            Ahora no
          </button>
          <Button onClick={submit}>Enviar calificación</Button>
        </div>
      </div>
    </Modal>
  );
}

type CardProps = {
  r: ServiceRequest;
  onCancel: () => void;
  onConfirm: () => void;
  onReport: () => void;
  onRate: () => void;
  onFindOther: () => void;
  onAutoClose: () => void;
};

function RequestCard({ r, onCancel, onConfirm, onReport, onRate, onFindOther, onAutoClose }: CardProps) {
  const [open, setOpen] = useState(false);
  const worker = workers.find((w) => w.id === r.workerId);
  const st = statusInfo[r.status];
  const flow = flowIndex(r.status);
  const showResult = (r.status === "pendiente_confirmacion" || r.status === "finalizada") && r.resultPhotos.length > 0;

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
        {worker && <Avatar name={worker.name} />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg uppercase tracking-wide text-forest-900">{r.serviceTitle}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${st.cls}`}>{st.label}</span>
          </div>
          {worker && (
            <Link
              to={`/trabajadores/${worker.id}`}
              className="text-sm font-semibold text-forest-700 underline-offset-4 hover:text-terracotta-500 hover:underline"
            >
              {worker.name}
            </Link>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-forest-900/60">
            <span className="flex items-center gap-1">
              <CalendarDays size={13} /> {formatDate(r.date)} · {r.slot}
            </span>
            <span className="flex items-center gap-1">
              <Banknote size={13} /> {r.advance > 0 ? `Anticipo ${colones(r.advance)}` : "Sin anticipo"}
            </span>
            <span className="flex items-center gap-1">
              <Paperclip size={13} /> {r.attachments.length} adjunto(s)
            </span>
          </div>
        </div>
      </div>

      {flow !== null && (
        <div className="mt-4">
          <Stepper steps={FLOW_STEPS} current={flow} />
        </div>
      )}

      <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-forest-900/80">{r.description}</p>

      {showResult && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-forest-900/50">Fotos del resultado</p>
          <ul className="grid grid-cols-4 gap-2">
            {r.resultPhotos.map((f) => (
              <li key={f.id} className="aspect-square overflow-hidden rounded-lg bg-forest-900/10">
                {f.kind === "imagen" ? (
                  <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                ) : (
                  <video src={f.url} controls className="h-full w-full object-cover" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <RequestOutcome request={r} viewer="cliente" />

      <p className="mt-3 text-xs font-semibold text-forest-900/50">
        {r.code} · Comprobante {r.receipt}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {r.status === "pendiente" && (
          <Button variant="light" onClick={onCancel} className="ring-1 ring-forest-900/15">
            Cancelar solicitud
          </Button>
        )}
        {r.status === "aceptada" && (
          <Button variant="light" onClick={onCancel} className="ring-1 ring-forest-900/15">
            Cancelar contratación
          </Button>
        )}
        {r.status === "pendiente_confirmacion" && (
          <>
            <Button onClick={onConfirm}>
              <Check size={16} className="transition-transform duration-200 group-hover:scale-125" />
              Confirmar que se realizó
            </Button>
            <Button variant="light" onClick={onReport} className="ring-1 ring-forest-900/15">
              <Flag size={16} className="transition-transform duration-200 group-hover:-rotate-12" />
              Reportar un problema
            </Button>
            <button
              type="button"
              onClick={onAutoClose}
              className="text-xs font-semibold text-forest-900/50 underline-offset-4 transition-colors hover:text-terracotta-500 hover:underline"
            >
              Demo: simular que no respondí a tiempo
            </button>
          </>
        )}
        {r.status === "finalizada" && !r.rating && (
          <Button onClick={onRate}>
            <Star size={16} className="transition-transform duration-200 group-hover:rotate-12 group-hover:scale-125" />
            Calificar servicio
          </Button>
        )}
        {(r.status === "rechazada" || r.status === "vencida") && (
          <Button onClick={onFindOther}>Buscar otro trabajador</Button>
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
            <div className="pl-1 pt-3">
              <Timeline events={r.events} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default function MyRequests() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.currentUser);
  const showToast = useAppStore((s) => s.showToast);
  const requests = useRequestsStore((s) => s.requests);
  const settings = useRequestsStore((s) => s.settings);
  const cancel = useRequestsStore((s) => s.cancel);
  const confirmService = useRequestsStore((s) => s.confirm);
  const report = useRequestsStore((s) => s.report);
  const rate = useRequestsStore((s) => s.rate);

  const [tab, setTab] = useState<Tab>("activas");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [rateId, setRateId] = useState<string | null>(null);

  const mine = requests.filter((r) => r.clientId === user?.id);
  const visible = mine.filter((r) => tabOf(r.status) === tab);

  const byId = (id: string | null) => (id ? mine.find((r) => r.id === id) : undefined);
  const cancelling = byId(cancelId);
  const reporting = byId(reportId);
  const rating = byId(rateId);
  const ratingWorker = rating ? workers.find((w) => w.id === rating.workerId) : undefined;

  const fee =
    cancelling && cancelling.status === "aceptada"
      ? Math.min(cancelling.advance, roundAdvance(cancelling.advance, settings.cancelFeePercent))
      : 0;

  const authorName = () => {
    const parts = (user?.name ?? "Cliente").split(" ").filter(Boolean);
    return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
  };

  return (
    <>
      <section className="rounded-b-[2rem] bg-forest-900 pb-6 text-white">
        <div className="mx-auto max-w-3xl px-4 pt-4">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl uppercase tracking-wide"
          >
            Mis solicitudes
          </motion.h1>
          <p className="text-white/70">Consulta el estado de los servicios que has pedido.</p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl space-y-4 px-4 pb-16 pt-6">
        {mine.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-14 text-center shadow-md shadow-black/5"
          >
            <ClipboardList size={40} className="text-terracotta-500" />
            <p className="font-semibold text-forest-900">Aún no tienes solicitudes</p>
            <p className="text-sm text-forest-900/60">Cuando pidas un servicio, aparecerá aquí con su estado.</p>
            <Button onClick={() => navigate("/buscar")}>Buscar trabajadores</Button>
          </motion.div>
        ) : (
          <>
            <div className="flex gap-1 overflow-x-auto rounded-xl bg-forest-900/5 p-1 [scrollbar-width:none]">
              {TAB_IDS.map((id) => {
                const count = mine.filter((r) => tabOf(r.status) === id).length;
                const active = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTab(id)}
                    className="relative flex-1 shrink-0 rounded-lg px-3 py-2 text-sm font-bold"
                  >
                    {active && (
                      <motion.span
                        layoutId="client-tab"
                        className="absolute inset-0 rounded-lg bg-white shadow"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span
                      className={`relative flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors ${
                        active ? "text-forest-900" : "text-forest-900/50 hover:text-forest-900"
                      }`}
                    >
                      {TAB_LABELS[id]}
                      {count > 0 && (
                        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-forest-900/10 px-1 text-[11px]">
                          {count}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {visible.length === 0 ? (
              <motion.p
                key={tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl bg-white px-6 py-12 text-center text-sm font-semibold text-forest-900/60 shadow-md shadow-black/5"
              >
                No hay solicitudes en esta sección.
              </motion.p>
            ) : (
              <motion.div layout className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {visible.map((r) => (
                    <RequestCard
                      key={r.id}
                      r={r}
                      onCancel={() => setCancelId(r.id)}
                      onConfirm={() => {
                        confirmService(r.id);
                        showToast("success", "¡Servicio confirmado! Gracias por usar la plataforma.");
                        setTab("finalizadas");
                        setRateId(r.id); // CU-11: se ofrece calificar (CU-12)
                      }}
                      onReport={() => setReportId(r.id)}
                      onRate={() => setRateId(r.id)}
                      onFindOther={() => navigate(`/buscar?categoria=${r.categoryId}`)}
                      onAutoClose={() => {
                        confirmService(r.id, true);
                        setTab("finalizadas");
                        showToast("info", "Plazo vencido (demo): el servicio se finalizó automáticamente.");
                      }}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Cancelar (CU-10) */}
      <ReasonModal
        open={!!cancelling}
        title={cancelling?.status === "aceptada" ? "Cancelar contratación" : "Cancelar solicitud"}
        description={
          cancelling &&
          (cancelling.advance === 0 ? (
            <p>Esta solicitud no tiene anticipo, así que no hay cobros ni devoluciones.</p>
          ) : fee > 0 ? (
            <p>
              Como la solicitud ya fue aceptada, se retiene una tarifa de <strong>{colones(fee)}</strong> (
              {settings.cancelFeePercent} % del anticipo). Se te devolverán{" "}
              <strong>{colones(cancelling.advance - fee)}</strong>.
            </p>
          ) : (
            <p>
              Aún no fue aceptada, así que se te devolverá el anticipo completo:{" "}
              <strong>{colones(cancelling.advance)}</strong>.
            </p>
          ))
        }
        confirmLabel="Confirmar cancelación"
        suggestions={["Ya no necesito el servicio", "Encontré otra opción", "Cambió mi disponibilidad"]}
        onConfirm={(reason) => {
          if (!cancelling) return;
          const res = cancel(cancelling.id, "cliente", reason);
          setCancelId(null);
          setTab("otras");
          if (!res) {
            showToast("error", "No se puede cancelar: el servicio ya inició. Puedes reportar un problema.");
            return;
          }
          showToast(
            "success",
            res.fee > 0
              ? `Contratación cancelada. Se devolvieron ${colones(res.refund)} y se retuvo una tarifa de ${colones(res.fee)}.`
              : `Solicitud cancelada. Se devolvió tu anticipo (${colones(res.refund)}).`,
          );
        }}
        onClose={() => setCancelId(null)}
      />

      {/* Reportar problema (CU-11, flujo alterno 3a) */}
      <ReasonModal
        open={!!reporting}
        title="Reportar un problema"
        description={<p>Cuéntanos qué pasó. El caso quedará en revisión del administrador.</p>}
        confirmLabel="Enviar reporte"
        suggestions={["El trabajo quedó incompleto", "El problema persiste", "El trabajador no llegó"]}
        onConfirm={(reason) => {
          if (!reporting) return;
          report(reporting.id, reason);
          setReportId(null);
          setTab("otras");
          showToast("info", "Reporte enviado. Un administrador revisará el caso.");
        }}
        onClose={() => setReportId(null)}
      />

      {/* Calificar (CU-12) */}
      <RateModal
        open={!!rating}
        workerName={ratingWorker?.name ?? "el trabajador"}
        onSubmit={(value) => {
          if (!rating) return;
          rate(rating.id, value, authorName());
          setRateId(null);
          showToast("success", `¡Gracias por calificar! Tu reseña ya aparece en el perfil de ${ratingWorker?.name ?? "el trabajador"}.`);
        }}
        onClose={() => setRateId(null)}
      />
    </>
  );
}