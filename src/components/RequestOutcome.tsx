import { useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, Ban, CheckCircle2, Clock, Scale, XCircle } from "lucide-react";
import Stars from "./Stars";
import type { ServiceRequest } from "../data/requests";
import { colones } from "../data/workers";
import { useRequestsStore } from "../store/useRequestsStore";

type Tone = "good" | "warn" | "bad";

const tones: Record<Tone, string> = {
  good: "bg-forest-700/10 text-forest-900",
  warn: "bg-gold-400/20 text-forest-900",
  bad: "bg-terracotta-500/10 text-terracotta-600",
};

function Note({ tone, icon, children }: { tone: Tone; icon: ReactNode; children: ReactNode }) {
  return (
    <div className={`mt-3 flex items-start gap-2 rounded-xl p-3 text-sm ${tones[tone]}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>{children}</div>
    </div>
  );
}

type Props = { request: ServiceRequest; viewer: "cliente" | "trabajador" };

// Resultado de una solicitud cerrada (rechazada, cancelada, vencida, en revisión o finalizada)
function Outcome({ request: r, viewer }: Props) {
  const refund = colones(r.refund ?? 0);
  const fee = r.fee ?? 0;

  if (r.status === "rechazada") {
    return (
      <Note tone="bad" icon={<XCircle size={18} />}>
        <p>
          <span className="font-semibold">Solicitud rechazada.</span> Motivo: {r.reason}
        </p>
        <p className="text-forest-900/70">
          {viewer === "cliente" ? `Se te devolvió el anticipo completo (${refund}).` : "El anticipo se devolvió al cliente."}
        </p>
      </Note>
    );
  }

  if (r.status === "cancelada") {
    const who = r.cancelledBy === viewer ? "ti" : `el ${r.cancelledBy}`;
    const detail =
      viewer === "cliente"
        ? fee > 0
          ? `Se te devolvieron ${refund} y se retuvo una tarifa de ${colones(fee)}.`
          : `Se te devolvió el anticipo completo (${refund}).`
        : fee > 0
          ? `El cliente pagó una tarifa de cancelación de ${colones(fee)}.`
          : "El anticipo se devolvió completo al cliente.";
    return (
      <Note tone="bad" icon={<Ban size={18} />}>
        <p>
          <span className="font-semibold">Cancelada por {who}.</span> Motivo: {r.reason}
        </p>
        <p className="text-forest-900/70">{detail}</p>
      </Note>
    );
  }

  if (r.status === "vencida") {
    return (
      <Note tone="warn" icon={<Clock size={18} />}>
        <p>
          {viewer === "cliente"
            ? `El trabajador no respondió a tiempo. Tu anticipo fue devuelto (${refund}). Te sugerimos buscar a otro.`
            : "No respondiste a tiempo: la solicitud venció y el anticipo se devolvió al cliente."}
        </p>
      </Note>
    );
  }

  if (r.status === "en_disputa") {
    return (
      <Note tone="warn" icon={<AlertTriangle size={18} />}>
        <p>
          <span className="font-semibold">
            {viewer === "cliente" ? "Reportaste que el trabajo no se completó." : "El cliente reportó que el trabajo no se completó."}
          </span>{" "}
          Motivo: {r.reason}
        </p>
        {r.workerReply && (
          <p className="mt-1">
            <span className="font-semibold">{viewer === "trabajador" ? "Tu versión:" : "Versión del trabajador:"}</span> {r.workerReply}
          </p>
        )}
        <p className="text-forest-900/70">El caso quedó en revisión del administrador.</p>
        {viewer === "trabajador" && !r.workerReply && <ReplyForm id={r.id} />}
      </Note>
    );
  }

  if (r.status === "finalizada") {
    return (
      <Note tone="good" icon={<CheckCircle2 size={18} />}>
        <p className="font-semibold">
          Servicio finalizado{r.autoClosed ? " (cierre automático por falta de respuesta del cliente)" : ""}.
        </p>
        {r.rating ? (
          <div className="mt-1">
            <Stars rating={r.rating.stars} size={14} />
            <p className="mt-1 text-forest-900/80">{r.rating.comment || "Sin comentario escrito."}</p>
          </div>
        ) : (
          viewer === "trabajador" && <p className="text-forest-900/70">El cliente aún no ha calificado.</p>
        )}
      </Note>
    );
  }

  return null;
}

function ReplyForm({ id }: { id: string }) {
  const reply = useRequestsStore((s) => s.replyDispute);
  const [text, setText] = useState("");
  return (
    <form
      className="mt-2 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        reply(id, text);
      }}
    >
      <label className="block text-xs font-semibold" htmlFor={`reply-${id}`}>
        Cuenta tu versión para el administrador
      </label>
      <textarea
        id={`reply-${id}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={500}
        className="w-full rounded-xl border border-forest-900/15 bg-white p-2 text-sm text-forest-900 outline-none focus:border-terracotta-500"
      />
      <p className="text-xs text-forest-900/60" aria-live="polite">
        {text.trim().length < 10
          ? `Escribe al menos 10 caracteres (llevas ${text.trim().length}).`
          : "Listo para enviar."}
      </p>
      <button
        type="submit"
        disabled={text.trim().length < 10}
        className="rounded-xl bg-forest-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
      >
        Enviar mi versión
      </button>
    </form>
  );
}

function Resolution({ request: r, viewer }: Props) {
  if (!r.resolution) return null;
  const mine = r.resolution.favor === viewer;
  return (
    <Note tone={mine ? "good" : "warn"} icon={<Scale size={18} />}>
      <p>
        <span className="font-semibold">Disputa resuelta a favor {r.resolution.favor === "cliente" ? "del cliente" : "del trabajador"}.</span>{" "}
        {r.resolution.note}
      </p>
      {r.resolution.favor === "cliente" && (
        <p className="text-forest-900/70">
          {viewer === "cliente" ? `Se te devolvió el anticipo completo (${colones(r.refund ?? 0)}).` : "El anticipo se devolvió al cliente."}
        </p>
      )}
    </Note>
  );
}

// Resultado de una solicitud cerrada (rechazada, cancelada, vencida, en revisión o finalizada)
export default function RequestOutcome(props: Props) {
  const r = props.request;
  if (r.resolution) {
    return (
      <>
        <Resolution {...props} />
        {r.status === "finalizada" && <Outcome {...props} />}
      </>
    );
  }
  return <Outcome {...props} />;
}
