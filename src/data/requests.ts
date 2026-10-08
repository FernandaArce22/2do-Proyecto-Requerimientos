export type LatLng = { lat: number; lng: number };

export type Attachment = {
  id: string;
  name: string;
  kind: "imagen" | "video";
  url: string;
  size: number;
};

export type RequestStatus = "pendiente" | "aceptada" | "rechazada" | "cancelada" | "finalizada" | "vencida";

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
};

export const statusInfo: Record<RequestStatus, { label: string; cls: string }> = {
  pendiente: { label: "Pendiente", cls: "bg-gold-400/30 text-forest-900" },
  aceptada: { label: "Aceptada", cls: "bg-forest-700/15 text-forest-800" },
  rechazada: { label: "Rechazada", cls: "bg-terracotta-500/15 text-terracotta-600" },
  cancelada: { label: "Cancelada", cls: "bg-terracotta-500/15 text-terracotta-600" },
  finalizada: { label: "Finalizada", cls: "bg-forest-900 text-white" },
  vencida: { label: "Vencida", cls: "bg-forest-900/10 text-forest-900/70" },
};

// Centro del mapa: Ciudad Quesada
export const DEFAULT_CENTER: LatLng = { lat: 10.3236, lng: -84.4277 };

export const SLOTS = ["8:00 a. m.", "10:00 a. m.", "1:00 p. m.", "3:00 p. m.", "5:00 p. m."];

// Anticipo redondeado a los ₡500 más cercanos
export const roundAdvance = (rate: number, percent: number) => Math.round((rate * percent) / 100 / 500) * 500;

export const todayISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export const formatDate = (iso: string) => {
  const text = new Date(`${iso}T00:00:00`).toLocaleDateString("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
};