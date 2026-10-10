import type { ReactNode } from "react";
import { AlertTriangle, Ban, CheckCircle2, Clock, XCircle } from "lucide-react";
import Stars from "./Stars";
import type { ServiceRequest } from "../data/requests";
import { colones } from "../data/workers";

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
export default function RequestOutcome({ request: r, viewer }: Props) {
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
        <p className="text-forest-900/70">El caso quedó en revisión del administrador.</p>
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