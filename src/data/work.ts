export type Doc = { name: string; url: string; size: number; isPdf: boolean };

export type AppStatus = "en_revision" | "verificado" | "rechazada";
export type AppEvent = { label: string; at: number };

// Postulación de un usuario para ser trabajador (CU-03)
export type Application = {
  id: string;
  userId: string;
  categories: string[];
  experience: string;
  zone: string;
  idDoc: Doc;
  backupDoc: Doc;
  status: AppStatus;
  submittedAt: number;
  infoRequest?: string; // información adicional pedida por el administrador
  infoReply?: string;
  decisionReason?: string;
  reviewedBy?: string;
  reviewedAt?: number;
  history: AppEvent[];
};

export const appStatusInfo: Record<AppStatus, { label: string; cls: string }> = {
  en_revision: { label: "En revisión", cls: "bg-gold-400/30 text-forest-900" },
  verificado: { label: "Verificado", cls: "bg-forest-700/15 text-forest-800" },
  rechazada: { label: "Rechazada", cls: "bg-terracotta-500/15 text-terracotta-600" },
};

// Parámetros del negocio que gestiona el administrador (CU-14).
// El anticipo y la tarifa de cancelación viven en useRequestsStore.
export type WorkSettings = { minMonthly: number; maxInactiveDays: number; graceDays: number };

export const defaultWorkSettings: WorkSettings = {
  minMonthly: 5, // trabajos completados al mes para mantener la cuenta activa
  maxInactiveDays: 30, // días sin trabajar que vuelven inactiva una cuenta
  graceDays: 30, // período de gracia para cuentas nuevas o reactivadas
};

// Trabajos completados en el mes por cada trabajador de ejemplo
export const baseMonthJobs: Record<string, number> = {
  w1: 5,
  w2: 0,
  w3: 6,
  w4: 8,
  w5: 5,
  w6: 5,
  w7: 2, // Diego no llega al mínimo: sirve para mostrar CU-13
  w8: 9,
  w9: 6,
  w10: 6,
};

const hoursAgo = (h: number) => Date.now() - h * 3_600_000;

// Postulación de ejemplo: Pedro Vargas (cuenta de demostración "Postulante")
export const seedApplications: Application[] = [
  {
    id: "app-seed1",
    userId: "u4",
    categories: ["carpinteria", "electricidad"],
    experience:
      "Tengo 8 años trabajando como ayudante y luego como carpintero independiente. He hecho closets, puertas y reparaciones eléctricas básicas en casas de la zona.",
    zone: "Pital",
    idDoc: { name: "cedula-pedro-vargas.jpg", url: "", size: 240_000, isPdf: false },
    backupDoc: { name: "referencias-laborales.pdf", url: "", size: 180_000, isPdf: true },
    status: "en_revision",
    submittedAt: hoursAgo(26),
    history: [{ label: "Postulación enviada", at: hoursAgo(26) }],
  },
];
