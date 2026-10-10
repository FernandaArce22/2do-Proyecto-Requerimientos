export type LatLng = { lat: number; lng: number };

export type Attachment = {
  id: string;
  name: string;
  kind: "imagen" | "video";
  url: string;
  size: number;
};

export type RequestStatus =
  | "pendiente"
  | "aceptada"
  | "pendiente_confirmacion"
  | "finalizada"
  | "rechazada"
  | "cancelada"
  | "vencida"
  | "en_disputa";

export type RequestEvent = { label: string; at: number };
export type Rating = { stars: number; comment: string };

export type ServiceRequest = {
  id: string;
  code: string;
  clientId: string;
  workerId: string;
  serviceTitle: string;
  categoryId: string;
  description: string;
  date: string; // AAAA-MM-DD
  slot: string;
  location: LatLng;
  directions: string;
  attachments: Attachment[];
  rate: number;
  advance: number;
  paymentMethod: "sinpe" | "tarjeta" | "sin_anticipo";
  receipt: string;
  status: RequestStatus;
  createdAt: number;
  events: RequestEvent[];
  resultPhotos: Attachment[];
  reason?: string; // motivo de rechazo, cancelación o reporte
  cancelledBy?: "cliente" | "trabajador";
  refund?: number;
  fee?: number;
  rating?: Rating;
  autoClosed?: boolean;
};

export const statusInfo: Record<RequestStatus, { label: string; cls: string }> = {
  pendiente: { label: "Pendiente", cls: "bg-gold-400/30 text-forest-900" },
  aceptada: { label: "Aceptada", cls: "bg-forest-700/15 text-forest-800" },
  pendiente_confirmacion: { label: "Por confirmar", cls: "bg-gold-500/25 text-forest-900" },
  finalizada: { label: "Finalizada", cls: "bg-forest-900 text-white" },
  rechazada: { label: "Rechazada", cls: "bg-terracotta-500/15 text-terracotta-600" },
  cancelada: { label: "Cancelada", cls: "bg-terracotta-500/15 text-terracotta-600" },
  vencida: { label: "Vencida", cls: "bg-forest-900/10 text-forest-900/70" },
  en_disputa: { label: "En revisión", cls: "bg-terracotta-500 text-white" },
};

// Etapas visibles en la barra de progreso
export const FLOW_STEPS = ["Enviada", "Aceptada", "Realizado", "Confirmado"];
export const flowIndex = (s: RequestStatus): number | null =>
  s === "pendiente"
    ? 1
    : s === "aceptada"
      ? 2
      : s === "pendiente_confirmacion"
        ? 3
        : s === "finalizada"
          ? FLOW_STEPS.length
          : null;

// Centro del mapa: Ciudad Quesada
export const DEFAULT_CENTER: LatLng = { lat: 10.3236, lng: -84.4277 };

export const SLOTS = ["8:00 a. m.", "10:00 a. m.", "1:00 p. m.", "3:00 p. m.", "5:00 p. m."];

// Anticipo redondeado a los ₡500 más cercanos
export const roundAdvance = (rate: number, percent: number) => Math.round((rate * percent) / 100 / 500) * 500;

export const addDaysISO = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export const todayISO = () => addDaysISO(0);

export const formatDate = (iso: string) => {
  const text = new Date(`${iso}T00:00:00`).toLocaleDateString("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatDateTime = (ts: number) =>
  new Date(ts).toLocaleString("es-CR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });